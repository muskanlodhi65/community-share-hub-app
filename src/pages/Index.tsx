import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { ItemCard } from '@/components/items/ItemCard';
import { 
  Leaf, Users, Package, ArrowRight, Recycle, Shield, Clock, 
  Wrench, Sprout, Tv, Tent, Utensils, BookOpen, Hammer, Sparkles, CheckCircle2 
} from 'lucide-react';

interface RecentItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  condition: string | null;
  is_available: boolean | null;
  is_verified: boolean | null;
  location: string | null;
  max_borrow_days: number | null;
  listing_type: string;
  price: number | null;
  categories: { name: string } | null;
}

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    fetchRecentItems();
  }, []);

  const fetchRecentItems = async () => {
    const { data } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        image_url,
        condition,
        is_available,
        is_verified,
        location,
        max_borrow_days,
        listing_type,
        price,
        categories (name)
      `)
      .order('created_at', { ascending: false })
      .limit(4);

    if (data) {
      setRecentItems(data as unknown as RecentItem[]);
    }
    setLoadingItems(false);
  };

  const categories = [
    { name: 'Tools', icon: Wrench, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    { name: 'Gardening', icon: Sprout, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { name: 'Electronics', icon: Tv, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { name: 'Outdoors', icon: Tent, color: 'bg-teal-500/10 text-teal-600 border-teal-200' },
    { name: 'Kitchen', icon: Utensils, color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
    { name: 'Books', icon: BookOpen, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { name: 'Hardware', icon: Hammer, color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  ];

  const features = [
    {
      icon: Recycle,
      title: 'Reduce Waste',
      description: 'Share resources instead of buying new. Help reduce landfill waste and carbon footprint in your community.'
    },
    {
      icon: Users,
      title: 'Build Community',
      description: 'Connect with neighbors and colleagues. Build trust through friendly local resource sharing.'
    },
    {
      icon: Shield,
      title: 'Verified Members',
      description: 'Community members pass verification for safe, reliable, and trustworthy transactions.'
    },
    {
      icon: Clock,
      title: 'Flexible Borrowing',
      description: 'Borrow tools or gear for custom time periods with our instant approval-based request system.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'List or Discover',
      description: 'Post items gathering dust at home, or browse what neighbors are offering to share.'
    },
    {
      number: '02',
      title: 'Connect & Request',
      description: 'Send a quick borrow request with your preferred dates, or message the owner directly.'
    },
    {
      number: '03',
      title: 'Share & Save',
      description: 'Pick up the item, complete your project, return it safely, and save money together!'
    }
  ];

  const stats = [
    { value: '500+', label: 'Items Listed' },
    { value: '200+', label: 'Verified Members' },
    { value: '1,000+', label: 'Successful Borrows' },
    { value: '~1.5T', label: 'CO₂ Saved Monthly' }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 lg:py-28 border-b">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 bg-primary/5 text-primary text-xs font-semibold gap-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" /> 🌱 Sustainable Community Sharing Platform
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="eco-gradient-text">{t('heroTitle')}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('heroSub')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {user ? (
                <>
                  <Button size="lg" onClick={() => navigate('/browse')} className="gap-2 text-base font-semibold shadow-md hover:shadow-lg transition-all">
                    {t('browseMarketplace')} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/add-item')} className="gap-2 text-base font-semibold border-2">
                    <Package className="h-4 w-4 text-primary" />
                    {t('listItemNav')}
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-base font-semibold shadow-md hover:shadow-lg transition-all">
                    Join Community Free <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/browse')} className="text-base font-semibold border-2">
                    {t('browse')}
                  </Button>
                </>
              )}
            </div>

            {/* Quick Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-6">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Free Community Signup
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Verified User Profiles
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Zero Listing Fees
              </span>
            </div>
          </div>
        </div>

        {/* Decorative backdrop blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Quick Category Navigation Pills */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="p-6 rounded-2xl bg-card border shadow-lg">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center sm:text-left">
            Popular Categories
          </h3>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            {categories.map((cat) => (
              <Button
                key={cat.name}
                variant="outline"
                onClick={() => navigate(`/browse?category=${cat.name}`)}
                className={`gap-2 rounded-full border transition-transform hover:scale-[1.03] ${cat.color}`}
              >
                <cat.icon className="h-4 w-4" />
                <span>{cat.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y bg-card/50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-1">
                <div className="text-3xl md:text-4xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Recent Items Preview Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <Badge variant="outline" className="mb-2 text-primary border-primary/30">
              Fresh Listings
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Available Nearby</h2>
            <p className="text-muted-foreground text-sm mt-1">Explore items recently shared by community members</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/browse')} className="mt-4 sm:mt-0 gap-1 text-primary hover:text-primary font-semibold">
            View All Marketplace Items <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {recentItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                imageUrl={item.image_url}
                condition={item.condition}
                isAvailable={item.is_available ?? true}
                isVerified={item.is_verified ?? false}
                location={item.location}
                categoryName={item.categories?.name ?? null}
                ownerName={null}
                maxBorrowDays={item.max_borrow_days}
                listingType={item.listing_type}
                price={item.price}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-8 rounded-xl border bg-card/40 border-dashed">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium text-sm">Be the first to share an item with your community!</p>
            <Button onClick={() => navigate('/add-item')} size="sm" className="mt-4 gap-2">
              <Package className="h-4 w-4" /> List an Item Now
            </Button>
          </div>
        )}
      </section>

      {/* How EcoHub Works - 3 Step Flow */}
      <section className="bg-muted/40 py-20 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <Badge variant="outline" className="text-primary border-primary/30">
              Simple 3-Step Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">How EcoHub Works</h2>
            <p className="text-muted-foreground text-sm">
              Sharing resources is safe, easy, and rewarding. Here is how you can start borrowing in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative p-8 rounded-2xl bg-card border shadow-xs space-y-4 hover:shadow-md transition-shadow">
                <div className="text-4xl font-black eco-gradient-text">{step.number}</div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Why Choose EcoHub?</h2>
          <p className="text-muted-foreground text-sm">
            Join a conscious community of neighbors committed to sharing resources responsibly.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-2xl border bg-card hover:shadow-md hover:border-primary/30 transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-10 md:p-16 text-center shadow-xl">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to start sharing & borrowing?
            </h2>
            <p className="opacity-90 text-sm md:text-base leading-relaxed">
              Join EcoHub today and become part of a sustainable community that values sharing over owning.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate(user ? '/browse' : '/auth')}
              className="font-bold text-base px-8 shadow-md hover:bg-white text-emerald-900"
            >
              {user ? 'Browse Marketplace' : 'Join Now – Free Account'}
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
