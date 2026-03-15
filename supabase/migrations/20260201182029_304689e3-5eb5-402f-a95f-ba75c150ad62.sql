-- Add listing type and price columns to items table
ALTER TABLE public.items 
ADD COLUMN listing_type text NOT NULL DEFAULT 'borrow',
ADD COLUMN price numeric DEFAULT NULL;

-- Create purchases table for tracking item sales
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchases
CREATE POLICY "Users can view own purchases as buyer"
ON public.purchases FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Users can view own sales as seller"
ON public.purchases FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all purchases"
ON public.purchases FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create purchases"
ON public.purchases FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update purchase status"
ON public.purchases FOR UPDATE
USING (auth.uid() = seller_id);

-- Add updated_at trigger
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();