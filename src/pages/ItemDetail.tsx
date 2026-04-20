import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ItemQuerySection } from '@/components/items/ItemQuerySection';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, differenceInDays } from 'date-fns';
import { 
  Loader2, MapPin, Calendar as CalendarIcon, CheckCircle2, Package, ArrowLeft, 
  User, Tag, MessageCircle, ShieldCheck, Maximize2 
} from 'lucide-react';

interface ItemDetailData {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  condition: string | null;
  is_available: boolean | null;
  is_verified: boolean | null;
  location: string | null;
  deposit_amount: number | null;
  max_borrow_days: number | null;
  owner_id: string;
  listing_type: string;
  price: number | null;
  categories: { name: string } | null;
}

interface OwnerProfile {
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  bio: string | null;
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
};

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [item, setItem] = useState<ItemDetailData | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [message, setMessage] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  const fetchItem = async () => {
    const { data: itemData, error: itemError } = await supabase
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
        deposit_amount,
        max_borrow_days,
        owner_id,
        listing_type,
        price,
        categories (name)
      `)
      .eq('id', id)
      .single();

    if (!itemError && itemData) {
      setItem(itemData as ItemDetailData);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, is_verified, bio')
        .eq('id', itemData.owner_id)
        .single();
      
      if (profileData) {
        setOwnerProfile(profileData);
      }
    }
    setLoading(false);
  };

  const handleBorrowRequest = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Select dates',
        description: 'Please select both start and end dates for borrowing.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from('borrow_requests')
      .insert({
        item_id: id,
        borrower_id: user.id,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        request_message: message || null
      });

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Request failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Request sent!',
        description: 'The owner will review your borrow request.'
      });
      navigate('/requests');
    }
  };

  const isSale = item?.listing_type === 'sale';
  const isOwner = user?.id === item?.owner_id;
  const maxEndDate = startDate && item?.max_borrow_days 
    ? addDays(startDate, item.max_borrow_days) 
    : undefined;

  const totalBorrowDays = (startDate && endDate)
    ? differenceInDays(endDate, startDate) + 1
    : 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!item) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold mb-2">Item not found</h2>
          <p className="text-muted-foreground text-sm mb-6">This item may have been removed or deleted.</p>
          <Button onClick={() => navigate('/browse')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Browse
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/browse')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
        </Button>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery & Lightbox */}
          <div className="lg:col-span-7 space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-muted border-2 cursor-pointer shadow-md">
                  {item.image_url && item.image_url.trim() !== '' && !imageError ? (
                    <>
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-semibold text-sm">
                        <Maximize2 className="h-5 w-5" /> Click to view full image
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-primary/10 dark:from-emerald-950/60 dark:to-teal-900/50">
                      <div className="p-5 rounded-3xl bg-background/80 shadow-md border border-primary/20 mb-3">
                        <Package className="h-16 w-16 text-primary" />
                      </div>
                      <span className="text-base font-extrabold text-foreground tracking-wide max-w-xs">{item.title}</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Community Resource Listing</span>
                    </div>
                  )}
                </div>
              </DialogTrigger>

              {item.image_url && !imageError && (
                <DialogContent className="max-w-4xl p-2 bg-black/90 border-none flex items-center justify-center">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="max-h-[85vh] w-auto object-contain rounded-lg"
                  />
                </DialogContent>
              )}
            </Dialog>

            {/* Quick Item Query Section */}
            {!isOwner && item.is_available && (
              <ItemQuerySection
                itemId={item.id}
                ownerId={item.owner_id}
                ownerName={ownerProfile?.full_name || 'the owner'}
              />
            )}
          </div>

          {/* Right Column: Information & Request Action Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {isSale ? (
                  <Badge className="gap-1 bg-emerald-600 text-white font-semibold">
                    <Tag className="h-3 w-3" /> For Sale
                  </Badge>
                ) : (
                  <Badge className="bg-primary text-primary-foreground font-semibold">
                    🤝 Borrowing Item
                  </Badge>
                )}
                {item.categories && (
                  <Badge variant="secondary">{item.categories.name}</Badge>
                )}
                {item.is_verified && (
                  <Badge className="gap-1 bg-blue-600 text-white">
                    <CheckCircle2 className="h-3 w-3" /> Verified Listing
                  </Badge>
                )}
                {!item.is_available && (
                  <Badge variant="destructive">{isSale ? 'Sold' : 'Currently Unavailable'}</Badge>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">{item.title}</h1>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {item.description || 'No detailed description provided by the owner.'}
                </p>
              </div>

              {/* Details Tags */}
              <div className="flex flex-wrap gap-4 text-xs pt-2 border-t border-b py-3">
                {item.location && (
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <MapPin className="h-4 w-4 text-primary" /> {item.location}
                  </span>
                )}
                {item.max_borrow_days && (
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <CalendarIcon className="h-4 w-4 text-primary" /> Up to {item.max_borrow_days} days
                  </span>
                )}
                {item.condition && (
                  <Badge variant="outline" className="capitalize font-medium">
                    Condition: {conditionLabels[item.condition] || item.condition}
                  </Badge>
                )}
              </div>

              {/* Price / Deposit Banner */}
              {isSale && item.price ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Purchase Price</p>
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-200">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Direct payment arrange with seller upon meetup</p>
                </div>
              ) : item.deposit_amount && item.deposit_amount > 0 ? (
                <div className="p-4 rounded-xl bg-muted/60 border space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Refundable Security Deposit</p>
                  <p className="text-2xl font-bold text-foreground">${item.deposit_amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Full deposit returned upon returning the item in good condition</p>
                </div>
              ) : null}
            </div>

            {/* Owner Info Card */}
            <Card className="rounded-xl border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Listed By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={ownerProfile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {getInitials(ownerProfile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-base">{ownerProfile?.full_name || 'Community Member'}</p>
                    {ownerProfile?.is_verified ? (
                      <p className="text-xs text-primary font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Member
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Community Contributor</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Borrow Request / Sale Action Box */}
            {!isOwner && item.is_available && (
              <>
                {isSale ? (
                  <Card className="border-2 border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Interested in Buying?</CardTitle>
                      <CardDescription>Contact the seller directly to arrange payment & pickup.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full gap-2 text-base font-semibold shadow-md" 
                        onClick={() => {
                          if (!user) {
                            navigate('/auth');
                            return;
                          }
                          navigate(`/messages?seller=${item.owner_id}&item=${item.id}`);
                        }}
                      >
                        <MessageCircle className="h-5 w-5" />
                        Message Seller Now
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2 border-primary/30 shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">Request to Borrow</CardTitle>
                      <CardDescription>Select dates to reserve this item</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-xs font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                {startDate ? format(startDate, 'PPP') : 'Pick start date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-xs font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                {endDate ? format(endDate, 'PPP') : 'Pick end date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                disabled={(date) => 
                                  !startDate || 
                                  date < startDate || 
                                  (maxEndDate ? date > maxEndDate : false)
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {totalBorrowDays > 0 && (
                        <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-between text-xs font-bold">
                          <span>Total Borrowing Duration:</span>
                          <Badge className="bg-primary text-primary-foreground">{totalBorrowDays} Day(s)</Badge>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Note to Owner (Optional)</Label>
                        <Textarea
                          placeholder="Introduce yourself or mention your project details..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={3}
                          className="text-xs"
                        />
                      </div>

                      <Button 
                        className="w-full font-bold shadow-sm" 
                        onClick={handleBorrowRequest}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          'Send Borrow Request'
                        )}
                      </Button>

                      <Button 
                        variant="outline"
                        className="w-full gap-2 text-xs" 
                        onClick={() => {
                          if (!user) {
                            navigate('/auth');
                            return;
                          }
                          navigate(`/messages?seller=${item.owner_id}&item=${item.id}`);
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message Owner Directly
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {isOwner && (
              <Button 
                variant="outline" 
                className="w-full border-2 font-semibold"
                onClick={() => navigate(`/edit-item/${item.id}`)}
              >
                Edit Item Listing
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ItemDetail;
