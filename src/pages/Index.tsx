import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { ItemCard } from '@/components/items/ItemCard';
import { useToast } from '@/hooks/use-toast';
import { sampleItems } from '@/data/sampleItems';
import {
  Leaf, Users, Package, ArrowRight, Recycle, Shield, Clock,
  Wrench, Sprout, Tv, Tent, Utensils, BookOpen, Hammer, Sparkles,
  CheckCircle2, HelpCircle, HeartHandshake, Star, Globe, TrendingUp,
  Dumbbell, ChevronDown, ChevronUp, Send, Mail, MessageSquare,
  Zap, BadgeCheck, Coins, TreePine, LogIn, Search,
  HandshakeIcon, RotateCcw, ThumbsUp, Camera
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

const faqs = [
  {
    q: 'What is Community Share Hub?',
    a: 'Community Share Hub is a local resource-sharing platform where verified community members can list items they own — tools, books, electronics, kitchen appliances, sports gear, and more — and lend them to neighbours for free or a small fee. It\'s a smarter, greener way to use what already exists in your community.',
  },
  {
    q: 'Is it free to join and list items?',
    a: 'Yes! Signing up is 100% free, and there are zero listing fees. Some owners may choose to set a refundable security deposit or a small daily rental fee — that\'s up to them.',
  },
  {
    q: 'How do I borrow an item?',
    a: 'Browse the marketplace, click on an item you need, select your preferred start and end dates, and send a borrow request. Once the owner approves, you arrange a convenient pickup. Simple!',
  },
  {
    q: 'How does member verification work?',
    a: 'Members verify via email and phone. Community reviews further build trust. Verified badges mean you can borrow and lend with confidence — knowing items will be handled responsibly and returned on time.',
  },
  {
    q: 'What if an item gets damaged during borrowing?',
    a: 'Owners can set a security deposit that covers any damage. Both parties agree to the condition of the item at pickup and return. Our community guidelines encourage honest, respectful communication to resolve any issues.',
  },
  {
    q: 'Can I list items for sale, not just borrowing?',
    a: 'Absolutely! Listings can be set as "For Borrowing" or "For Sale". You choose the type when creating your listing. This gives you flexibility to either lend temporarily or sell items you no longer need.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. We only show your display name and verified badge publicly. Your phone, address, and personal details are never shared without your consent. All data is stored securely via Supabase with row-level security.',
  },
  {
    q: 'How do I report a problem or bad actor?',
    a: 'Use the "Report" feature on any item listing or user profile, or contact us via the query form on this page. Our moderation team reviews all reports within 24 hours.',
  },
];

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Query form state
  const [queryForm, setQueryForm] = useState({ name: '', email: '', message: '' });
  const [querySending, setQuerySending] = useState(false);

  // Auto-rotating spotlight for 'What is Community Share Hub'
  const [activePillar, setActivePillar] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePillar((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRecentItems();
  }, []);

  const fetchRecentItems = async () => {
    try {
      const { data } = await supabase
        .from('items')
        .select(`id, title, description, image_url, condition, is_available, is_verified,
          location, max_borrow_days, listing_type, price, categories (name)`)
        .order('created_at', { ascending: false })
        .limit(8);
      if (data && data.length > 0) {
        setRecentItems(data as unknown as RecentItem[]);
      } else {
        setRecentItems(sampleItems as unknown as RecentItem[]);
      }
    } catch {
      setRecentItems(sampleItems as unknown as RecentItem[]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryForm.name || !queryForm.email || !queryForm.message) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setQuerySending(true);
    await new Promise(r => setTimeout(r, 1200));
    setQuerySending(false);
    setQueryForm({ name: '', email: '', message: '' });
    toast({
      title: '✅ Query Sent!',
      description: 'We\'ll get back to you within 24 hours.',
    });
  };

  const categories = [
    { name: 'Tools', img: '/categories/tools.jpg', icon: Wrench, count: '75+ items', desc: 'Cordless drills, toolkits, saws & ladders', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
    { name: 'Gardening', img: '/categories/gardening.jpg', icon: Sprout, count: '48+ items', desc: 'Lawn mowers, hedge trimmers, pots & soil', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'Electronics', img: '/categories/electronics.jpg', icon: Tv, count: '92+ items', desc: 'Gaming consoles, cameras, projectors & audio', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'Outdoors', img: '/categories/outdoors.jpg', icon: Tent, count: '54+ items', desc: 'Camping tents, sleeping bags & stoves', color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
    { name: 'Kitchen', img: '/categories/kitchen.jpg', icon: Utensils, count: '63+ items', desc: 'Blenders, stand mixers & espresso machines', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
    { name: 'Books', img: '/categories/books.jpg', icon: BookOpen, count: '120+ items', desc: 'Bestseller fiction, non-fiction & study guides', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { name: 'Hardware', img: '/categories/hardware.jpg', icon: Hammer, count: '40+ items', desc: 'Hammers, workbenches, fixings & toolsets', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
    { name: 'Sports', img: '/categories/sports.jpg', icon: Dumbbell, count: '58+ items', desc: 'Dumbbells, fitness gear, cycles & rackets', color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
  ];

  const benefits = [
    {
      icon: Coins, color: 'bg-amber-500',
      title: 'Save Money',
      desc: 'Why buy something you\'ll use once? Borrow it for free or a fraction of the cost. Members save an average of ₹2,000+ monthly.'
    },
    {
      icon: Recycle, color: 'bg-emerald-500',
      title: 'Reduce Waste',
      desc: 'Every borrowed item is one less product manufactured. Share resources, cut emissions, and shrink your carbon footprint.'
    },
    {
      icon: Users, color: 'bg-blue-500',
      title: 'Build Community',
      desc: 'Strengthen bonds with neighbours. Sharing creates trust, friendships, and a true sense of belonging in your area.'
    },
    {
      icon: BadgeCheck, color: 'bg-violet-500',
      title: 'Earn Extra Income',
      desc: 'List items you rarely use and earn a rental income. Your drill, camera, or tent can work for you while you\'re not using them.'
    },
    {
      icon: Shield, color: 'bg-teal-500',
      title: 'Safe & Verified',
      desc: 'All members go through verification. Ratings, reviews, and security deposits ensure safe, accountable transactions.'
    },
    {
      icon: TreePine, color: 'bg-green-600',
      title: 'Eco-Friendly Living',
      desc: 'Join a movement of conscious consumers choosing access over ownership — better for your wallet and the planet.'
    },
  ];

  const steps = [
    {
      number: '01', icon: LogIn,
      title: 'Sign Up Free',
      desc: 'Create your free account in 60 seconds. Verify your email and phone to get your trusted member badge.',
      tip: 'No credit card required'
    },
    {
      number: '02', icon: Search,
      title: 'Browse or List',
      desc: 'Search for items you need in your community, or list items you own to share with others. Both are completely free.',
      tip: 'Filter by category, location & availability'
    },
    {
      number: '03', icon: MessageSquare,
      title: 'Request & Connect',
      desc: 'Found something you need? Send a borrow request with your preferred dates. The owner gets notified instantly.',
      tip: 'Message the owner directly'
    },
    {
      number: '04', icon: HandshakeIcon,
      title: 'Pick Up & Use',
      desc: 'Once approved, arrange a convenient pickup. Inspect the item together, use it for your project, and enjoy the savings!',
      tip: 'Agree on condition at handover'
    },
    {
      number: '05', icon: RotateCcw,
      title: 'Return & Review',
      desc: 'Return the item on time in the same condition. Leave an honest review to build trust in the community.',
      tip: 'Good reviews unlock better listings'
    },
    {
      number: '06', icon: ThumbsUp,
      title: 'Repeat & Grow',
      desc: 'The more you share and borrow, the stronger your community becomes. Invite neighbours to multiply the benefit!',
      tip: 'Referrals unlock special perks'
    },
  ];

  const stats = [
    { value: '500+', label: 'Items Listed', icon: Package, color: 'text-emerald-600' },
    { value: '200+', label: 'Verified Members', icon: Users, color: 'text-teal-600' },
    { value: '1,000+', label: 'Successful Borrows', icon: TrendingUp, color: 'text-blue-600' },
    { value: '₹0', label: 'Listing Fees', icon: Star, color: 'text-violet-600' },
  ];

  const heroItems = [
    {
      img: '/items/drill.jpg',
      label: 'Professional Cordless Drill',
      cat: 'Tools',
      status: 'Available',
      owner: 'Rahul M.',
      price: 'Free / borrow',
    },
    {
      img: '/items/books.jpg',
      label: 'Bestseller Book Collection',
      cat: 'Books',
      status: 'Available',
      owner: 'Sneha R.',
      price: 'Free',
    },
    {
      img: '/items/controller.jpg',
      label: 'RedGear Gaming Controller',
      cat: 'Electronics',
      status: 'Available',
      owner: 'Arjun K.',
      price: '₹80/day',
    },
    {
      img: '/items/camera.jpg',
      label: 'Canon EOS DSLR Camera',
      cat: 'Photography',
      status: 'Available',
      owner: 'Priya S.',
      price: '₹150/day',
    },
  ];

  const tickerItems = [
    { img: '/items/drill.jpg',      label: 'Cordless Drill',      cat: 'Tools',       price: 'Free',     status: 'Available' },
    { img: '/items/books.jpg',      label: 'Book Collection',     cat: 'Books',       price: 'Free',     status: 'Available' },
    { img: '/items/controller.jpg', label: 'Gaming Controller',   cat: 'Electronics', price: '₹80/day',  status: 'Available' },
    { img: '/items/camera.jpg',     label: 'Canon DSLR Camera',   cat: 'Photography', price: '₹150/day', status: 'Available' },
    { img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=200&q=80', label: 'Camping Tent', cat: 'Outdoors', price: '₹50/day', status: 'Borrowed' },
    { img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=200&q=80', label: 'Lawn Mower', cat: 'Gardening', price: 'Free', status: 'Available' },
    { img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80', label: 'PS5 Console', cat: 'Electronics', price: '₹100/day', status: 'Available' },
    { img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80', label: 'Bicycle', cat: 'Sports', price: '₹30/day', status: 'Available' },
  ];

  return (
    <MainLayout>

      {/* ══════════════════════════════════════
          TOP FEATURED VIDEO SHOWCASE
      ══════════════════════════════════════ */}
      <section className="bg-slate-950 text-white relative overflow-hidden border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 space-y-2.5">
            <Badge className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1.5 backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Watch: Community Share Hub in Action
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Discover How <span className="text-emerald-400">Community Sharing</span> Works
            </h2>
            <p className="text-white/70 text-xs sm:text-sm max-w-xl">
              Borrow tools, books, and gear from neighbours. Save money, reduce waste, and build a connected community.
            </p>
          </div>

          {/* Video Player Box with Ambient Glow */}
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-700" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
              <video
                src="/community-share-hub-video.mp4"
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto max-h-[500px] object-cover mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HERO SECTION — Real Item Images
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 45%, #52b788 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #95d5b2, transparent)', transform: 'translate(20%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #74c69d, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── LEFT: Headline + CTAs ── */}
            <div className="space-y-6">
              <div className="animate-fade-up">
                <Badge className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white border-white/25 backdrop-blur-sm gap-1.5">
                  <Leaf className="h-3.5 w-3.5" /> 🌱 Sustainable Community Sharing Platform
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white animate-fade-up-2">
                Share More.<br />
                Spend Less.<br />
                <span style={{ color: '#b7e4c7' }}>Build Community.</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md leading-relaxed animate-fade-up-3">
                Borrow tools, books, gear and more from your neighbours — for free or a small fee. A smarter, greener, more connected way to live.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-up-4">
                <Button size="lg" onClick={() => navigate('/browse')}
                  className="gap-2 text-base font-bold bg-white text-emerald-900 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  Browse Items <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate(user ? '/add-item' : '/auth')}
                  className="gap-2 text-base font-semibold border-2 border-white/35 text-white hover:bg-white/10">
                  {user ? <><Package className="h-4 w-4" /> List Your Item</> : '🚀 Join for Free'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-5 text-xs text-white/65 pt-1 animate-fade-up-5">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: '#b7e4c7' }} /> Free Signup</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: '#b7e4c7' }} /> Verified Profiles</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: '#b7e4c7' }} /> Zero Listing Fees</span>
              </div>
            </div>

            {/* ── RIGHT: Real Item Image Cards with Dynamic Up & Down Float Flow ── */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:max-w-none w-full">
              {/* Column 1: Drill & Gaming Controller (Glides Up & Down) */}
              <div className="space-y-4 animate-float-col-1">
                {[heroItems[0], heroItems[2]].map((item, idx) => (
                  <div key={idx}
                    onClick={() => navigate('/browse')}
                    className="rounded-2xl border border-white/25 shadow-2xl cursor-pointer overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:border-emerald-300/60"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(16px)',
                    }}>
                    {/* Image */}
                    <div className="relative h-36 sm:h-40 overflow-hidden">
                      <img src={item.img} alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      {/* Status pill */}
                      <div className="absolute top-2.5 right-2.5 text-[10px] px-2.5 py-1 rounded-full font-bold shadow bg-emerald-500 text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {item.status}
                      </div>
                      {/* Category chip */}
                      <div className="absolute bottom-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white/95 backdrop-blur-sm font-medium">
                        {item.cat}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3.5">
                      <div className="text-white font-bold text-sm leading-tight truncate">{item.label}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-white/60 text-xs">{item.owner}</span>
                        <span className="text-emerald-300 text-xs font-bold">{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Books & Camera (Glides Down & Up with offset) */}
              <div className="space-y-4 pt-6 sm:pt-8 animate-float-col-2">
                {[heroItems[1], heroItems[3]].map((item, idx) => (
                  <div key={idx}
                    onClick={() => navigate('/browse')}
                    className="rounded-2xl border border-white/25 shadow-2xl cursor-pointer overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:border-emerald-300/60"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(16px)',
                    }}>
                    {/* Image */}
                    <div className="relative h-36 sm:h-40 overflow-hidden">
                      <img src={item.img} alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      {/* Status pill */}
                      <div className="absolute top-2.5 right-2.5 text-[10px] px-2.5 py-1 rounded-full font-bold shadow bg-emerald-500 text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {item.status}
                      </div>
                      {/* Category chip */}
                      <div className="absolute bottom-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white/95 backdrop-blur-sm font-medium">
                        {item.cat}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3.5">
                      <div className="text-white font-bold text-sm leading-tight truncate">{item.label}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-white/60 text-xs">{item.owner}</span>
                        <span className="text-emerald-300 text-xs font-bold">{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L1440 50L1440 15C1200 50 960 0 720 18C480 36 240 0 0 15L0 50Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INFINITE SCROLL TICKER — Auto-scrolling item showcase
      ══════════════════════════════════════ */}
      <section className="border-b bg-card/80 py-3 overflow-hidden">
        <div className="flex w-max animate-ticker gap-0">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i}
              onClick={() => navigate('/browse')}
              className="flex items-center gap-3 mx-3 px-4 py-2.5 rounded-2xl border bg-background hover:shadow-md hover:border-emerald-300 cursor-pointer flex-shrink-0 group transition-all">
              {/* Thumbnail */}
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                <img src={item.img} alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground whitespace-nowrap">{item.label}</div>
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">{item.cat} • {item.price}</div>
              </div>
              <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${item.status === 'Available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'}`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`flex items-center gap-3 p-5 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 animate-fade-up-${Math.min(i + 1, 5)}`}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-extrabold leading-none ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHAT IS COMMUNITY SHARE HUB?
      ══════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400">
              About Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What is <span className="text-emerald-600">Community Share Hub?</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Community Share Hub is a <strong>hyperlocal resource-sharing marketplace</strong> that connects neighbours, colleagues, and community members to share physical items — instead of everyone buying their own.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Think about the tools in your garage, the books on your shelf, or the camping gear collecting dust. Someone nearby needs exactly those things today. Meanwhile, you need something they own. Community Share Hub makes that exchange effortless, safe, and rewarding.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              It's not just a marketplace — it's a movement towards <strong>conscious consumption</strong>, where communities thrive by sharing rather than hoarding.
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => navigate('/browse')} className="gap-2" style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)' }}>
                Explore Listings <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')} className="gap-2">
                Join the Community
              </Button>
            </div>
          </div>

          {/* Visual info cards with Real Uploaded Images & Rotating Dynamic Flow */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  img: '/about/hyperlocal.png',
                  tag: 'Hyperlocal',
                  title: 'Nearby Community',
                  desc: 'Share within your neighbourhood, building, or city with real-time local availability.',
                  tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                },
                {
                  img: '/about/trust.png',
                  tag: 'Trust & Safety',
                  title: 'Verified & Secure',
                  desc: 'ID-verified member profiles, trust ratings, and security deposit protection.',
                  tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                },
                {
                  img: '/about/eco.png',
                  tag: 'Eco-First',
                  title: 'Green Planet First',
                  desc: 'Every borrow reduces landfill waste, carbon footprints, and unnecessary over-production.',
                  tagColor: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                },
                {
                  img: '/about/save.png',
                  tag: 'Save & Earn',
                  title: 'Save Time & Money',
                  desc: 'Borrow at a fraction of retail prices and earn passive money from items sitting idle in your house.',
                  tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                },
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={() => setActivePillar(i)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-500 space-y-3 group flex flex-col justify-between cursor-pointer animate-rotate-dynamic-${i + 1} ${
                    activePillar === i
                      ? 'bg-card ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 border-emerald-400 scale-[1.02] z-10'
                      : 'bg-card/90 hover:bg-card border-border/60 hover:border-emerald-400/50 shadow-sm hover:shadow-xl hover:scale-[1.02]'
                  }`}
                >
                  {/* Image Showcase */}
                  <div className={`h-36 sm:h-40 rounded-xl overflow-hidden flex items-center justify-center p-2.5 relative border transition-all duration-500 ${
                    activePillar === i ? 'bg-emerald-500/10 border-emerald-400/60' : 'bg-muted/40 border-border/40 group-hover:border-emerald-300/40'
                  }`}>
                    <img
                      src={card.img}
                      alt={card.title}
                      className={`w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 ${
                        activePillar === i ? 'scale-105' : ''
                      }`}
                      loading="lazy"
                    />
                    <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${card.tagColor} shadow-sm backdrop-blur-sm`}>
                      {card.tag}
                    </span>
                    {activePillar === i && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-md animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Active
                      </span>
                    )}
                  </div>
                  {/* Content */}
                  <div>
                    <div className="font-extrabold text-base text-foreground group-hover:text-emerald-600 transition-colors">
                      {card.title}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {card.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rotating Dynamic Spotlight Navigation Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {['Hyperlocal', 'Trust & Safety', 'Eco-First', 'Save & Earn'].map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePillar(idx)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                    activePillar === idx
                      ? 'bg-emerald-600 text-white shadow-md scale-105 font-bold'
                      : 'bg-muted/70 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activePillar === idx ? 'bg-white animate-ping' : 'bg-muted-foreground/50'}`} />
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BROWSE BY CATEGORY — Dynamic Flow with Real Images
      ══════════════════════════════════════ */}
      <section className="py-16 bg-muted/25 border-y overflow-hidden relative">
        <div className="container mx-auto px-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 mb-2">
                Explore Everything
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Browse by <span className="text-emerald-600">Category</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Discover thousands of verified community items available to borrow or rent near you.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/browse')}
              className="gap-2 font-semibold self-start sm:self-auto hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-sm"
            >
              <Globe className="h-4 w-4" /> View All Listings <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dynamic Auto-Flow Category Image Cards Marquee */}
        <div className="w-full overflow-hidden py-3">
          <div className="flex w-max animate-ticker gap-4 px-4 hover:[animation-play-state:paused]">
            {[...categories, ...categories].map((cat, i) => (
              <div
                key={i}
                onClick={() => navigate(`/browse?category=${cat.name}`)}
                className="w-64 sm:w-72 rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-2xl hover:border-emerald-400/70 cursor-pointer flex-shrink-0 group transition-all duration-300 hover:-translate-y-2 relative"
              >
                {/* Category Image with Gradient */}
                <div className="h-44 sm:h-48 overflow-hidden relative">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  {/* Category icon pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow">
                    <cat.icon className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{cat.name}</span>
                  </div>

                  {/* Count pill */}
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {cat.count}
                  </div>

                  {/* Bottom title & description */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="font-extrabold text-lg flex items-center justify-between">
                      <span>{cat.name}</span>
                      <span className="text-xs text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Browse <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="text-xs text-white/80 line-clamp-1 mt-0.5">
                      {cat.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Clickable Category Filter Chips */}
        <div className="container mx-auto px-4 mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/browse')}
              className="rounded-full px-4 text-xs font-semibold shadow-sm"
            >
              <Globe className="h-3.5 w-3.5 mr-1" /> All Items
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.name}
                variant="outline"
                size="sm"
                onClick={() => navigate(`/browse?category=${cat.name}`)}
                className="rounded-full px-4 text-xs font-semibold border transition-all hover:scale-105 hover:border-emerald-400 hover:text-emerald-700 gap-1.5"
              >
                <cat.icon className="h-3.5 w-3.5 text-emerald-600" />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BENEFITS
      ══════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400">
              Why Join?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Benefits of Sharing</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Community Share Hub isn't just about saving money — it's about building a better, greener, more connected world.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="group p-6 rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform ${b.color}`}>
                  <b.icon className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-lg">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS — STEP BY STEP
      ══════════════════════════════════════ */}
      <section className="py-20 border-y" style={{ background: 'linear-gradient(180deg, hsl(var(--muted)/0.5) 0%, hsl(var(--background)) 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400">
              Step-by-Step Guide
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              From sign-up to first borrow — follow our seamless 6-step community sharing cycle.
            </p>
          </div>

          {/* Sequential Dynamic Step Progression Flow Bar */}
          <div className="hidden md:flex items-center justify-center gap-2 mb-12 flex-wrap">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border shadow-xs text-xs font-bold hover:border-emerald-400 transition-colors">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">
                    {s.number}
                  </span>
                  <span className="text-foreground">{s.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-emerald-600 animate-arrow-glide flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Step Cards with Dynamic Directional Arrows */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col justify-between p-6 rounded-2xl bg-card border hover:shadow-2xl hover:border-emerald-400/60 hover:-translate-y-1.5 transition-all duration-300 space-y-4 group">
                {/* Background number watermark */}
                <div className="absolute -right-3 -top-3 text-[7rem] font-black opacity-[0.04] select-none pointer-events-none leading-none" style={{ color: '#2d6a4f' }}>
                  {step.number}
                </div>

                {/* Header: Step Badge + Sequential 'Next Step' Arrow Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)' }}>
                      {step.number}
                    </div>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors">
                      <step.icon className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>

                  {/* Dynamic 'Next Step' flow tag */}
                  {i < steps.length - 1 ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <span>Then Step {steps[i + 1].number}</span>
                      <ArrowRight className="h-3.5 w-3.5 animate-arrow-glide" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-sm">
                      <RotateCcw className="h-3 w-3 animate-spin-slow" /> Endless Cycle
                    </div>
                  )}
                </div>

                {/* Step Body */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-emerald-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Footer Tip */}
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full w-fit">
                  <Zap className="h-3 w-3" /> {step.tip}
                </div>

                {/* ── Dynamic Inter-Card Connecting Arrows on Desktop ── */}
                {/* Horizontal arrows between columns 1->2 and 2->3 */}
                {(i === 0 || i === 1 || i === 3 || i === 4) && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-emerald-600 text-white shadow-lg items-center justify-center border-2 border-background animate-arrow-glide pointer-events-none">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}

                {/* Downward arrow connecting Row 1 (Step 03) to Row 2 (Step 04) */}
                {i === 2 && (
                  <div className="hidden lg:flex absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-emerald-600 text-white shadow-lg items-center gap-1 text-[11px] font-bold border-2 border-background animate-arrow-glide-down pointer-events-none">
                    <span>Next Row</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate(user ? '/browse' : '/auth')}
              className="gap-2 font-bold px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)' }}>
              {user ? 'Start Browsing' : 'Get Started — It\'s Free'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          RECENT LISTINGS
      ══════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <Badge variant="outline" className="mb-2 text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400">
              Fresh Listings
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Available Nearby</h2>
            <p className="text-muted-foreground text-sm mt-1">Items recently shared by community members</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/browse')}
            className="mt-4 sm:mt-0 gap-1 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {recentItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} id={item.id} title={item.title}
                description={item.description} imageUrl={item.image_url}
                condition={item.condition} isAvailable={item.is_available ?? true}
                isVerified={item.is_verified ?? false} location={item.location}
                categoryName={item.categories?.name ?? null} ownerName={null}
                maxBorrowDays={item.max_borrow_days} listingType={item.listing_type}
                price={item.price} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed bg-card/40">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50 dark:bg-emerald-950/20">
              <Package className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg mb-1">Be the first to share!</h3>
            <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">No items listed yet. Start the community by sharing something you own.</p>
            <Button onClick={() => navigate(user ? '/add-item' : '/auth')}
              className="gap-2 font-semibold" style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)' }}>
              <Package className="h-4 w-4" /> {user ? 'List an Item' : 'Join & Start Sharing'}
            </Button>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════
          FAQ — QUESTIONS & ANSWERS
      ══════════════════════════════════════ */}
      <section className="py-20 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400">
              <HelpCircle className="h-3.5 w-3.5 mr-1" /> Got Questions?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Everything you need to know about borrowing, lending, and using Community Share Hub.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i}
                className={`rounded-2xl border bg-card overflow-hidden transition-all duration-200 ${openFaq === i ? 'shadow-md' : 'hover:shadow-sm'}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                >
                  <span className="font-semibold text-sm sm:text-base leading-snug">{faq.q}</span>
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${openFaq === i ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {openFaq === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
            <Button variant="outline" onClick={() => navigate('/faq-feedback')} className="gap-2 font-semibold">
              <MessageSquare className="h-4 w-4" /> Visit Full FAQ & Feedback Page
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SEND A QUERY FORM
      ══════════════════════════════════════ */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left info */}
            <div className="space-y-6">
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400">
                <Mail className="h-3.5 w-3.5 mr-1" /> Contact Us
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Send Us a Query</h2>
              <p className="text-muted-foreground leading-relaxed">
                Have a question, suggestion, or issue not covered in the FAQs? Drop us a message and our team will get back to you within 24 hours.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  { icon: MessageSquare, title: 'General Queries', desc: 'Questions about how the platform works.' },
                  { icon: Shield, title: 'Trust & Safety', desc: 'Report issues or concerns about members/items.' },
                  { icon: Sparkles, title: 'Feature Suggestions', desc: 'Ideas for making the platform better.' },
                  { icon: HeartHandshake, title: 'Partnership', desc: 'Interested in collaborating with us.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="p-8 rounded-3xl border bg-card shadow-sm">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-600" /> Write to Us
              </h3>
              <form onSubmit={handleQuerySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Your Name <span className="text-red-500">*</span></label>
                  <Input
                    id="query-name"
                    placeholder="e.g. Rahul Sharma"
                    value={queryForm.name}
                    onChange={e => setQueryForm(p => ({ ...p, name: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                  <Input
                    id="query-email"
                    type="email"
                    placeholder="you@example.com"
                    value={queryForm.email}
                    onChange={e => setQueryForm(p => ({ ...p, email: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Your Message <span className="text-red-500">*</span></label>
                  <Textarea
                    id="query-message"
                    placeholder="Describe your query, suggestion, or issue in detail..."
                    value={queryForm.message}
                    onChange={e => setQueryForm(p => ({ ...p, message: e.target.value }))}
                    className="rounded-xl min-h-[140px] resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={querySending}
                  className="w-full gap-2 font-bold text-base py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)' }}
                >
                  {querySending ? (
                    <><div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send My Query</>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We respect your privacy. Your email will only be used to respond to your query.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="container mx-auto px-4 pb-16">
        <div className="relative rounded-3xl overflow-hidden text-white p-10 md:p-16 text-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 50%, #52b788 100%)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #b7e4c7, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #74c69d, transparent)', transform: 'translate(-30%, 30%)' }} />
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to start sharing?</h2>
            <p className="opacity-85 text-sm md:text-base leading-relaxed">
              Join Community Share Hub today. List your first item in 2 minutes or borrow something your neighbour already owns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" onClick={() => navigate(user ? '/browse' : '/auth')}
                className="font-bold text-base px-8 bg-white text-emerald-900 hover:bg-white/90 shadow-lg">
                {user ? '🌿 Browse Marketplace' : '🌱 Join Now — Free'}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/faq-feedback')}
                className="font-semibold border-white/35 text-white hover:bg-white/10">
                <HelpCircle className="h-4 w-4 mr-2" /> FAQs & Feedback
              </Button>
            </div>
          </div>
        </div>
      </section>

    </MainLayout>
  );
};

export default Index;
