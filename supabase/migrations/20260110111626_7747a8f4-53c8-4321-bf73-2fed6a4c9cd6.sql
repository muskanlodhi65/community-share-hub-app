-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'member');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  is_available BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  location TEXT,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  max_borrow_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create borrow_requests table
CREATE TABLE public.borrow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'returned', 'overdue')) DEFAULT 'pending',
  request_message TEXT,
  owner_response TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_return_date DATE,
  condition_on_return TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles RLS policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Categories RLS policies
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Items RLS policies
CREATE POLICY "Anyone can view available items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Users can create items" ON public.items FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own items" ON public.items FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own items" ON public.items FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all items" ON public.items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Borrow requests RLS policies
CREATE POLICY "Users can view own requests" ON public.borrow_requests FOR SELECT 
  USING (auth.uid() = borrower_id OR auth.uid() IN (SELECT owner_id FROM public.items WHERE id = item_id));
CREATE POLICY "Users can create requests" ON public.borrow_requests FOR INSERT WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Owners and borrowers can update requests" ON public.borrow_requests FOR UPDATE 
  USING (auth.uid() = borrower_id OR auth.uid() IN (SELECT owner_id FROM public.items WHERE id = item_id));
CREATE POLICY "Admins can view all requests" ON public.borrow_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'member');
  
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_borrow_requests_updated_at BEFORE UPDATE ON public.borrow_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, description, icon) VALUES
  ('Tools', 'Hand tools, power tools, and DIY equipment', 'Wrench'),
  ('Sports Equipment', 'Sports gear, fitness equipment, and outdoor recreation', 'Dumbbell'),
  ('Electronics', 'Gadgets, cameras, gaming consoles, and tech devices', 'Laptop'),
  ('Kitchen Appliances', 'Cooking equipment, blenders, and kitchen gadgets', 'ChefHat'),
  ('Books & Media', 'Books, magazines, DVDs, and educational materials', 'BookOpen'),
  ('Garden & Outdoor', 'Lawn equipment, garden tools, and outdoor furniture', 'TreeDeciduous'),
  ('Party & Events', 'Party supplies, decorations, and event equipment', 'PartyPopper'),
  ('Travel & Luggage', 'Suitcases, backpacks, and travel accessories', 'Briefcase');