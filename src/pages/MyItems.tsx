import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Package, MapPin, Calendar, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MyItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  condition: string | null;
  is_available: boolean | null;
  is_verified: boolean | null;
  location: string | null;
  max_borrow_days: number | null;
  categories: { name: string } | null;
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
};

const MyItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const fetchItems = async () => {
    const { data, error } = await supabase
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
        categories (name)
      `)
      .eq('owner_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data as unknown as MyItem[]);
    }
    setLoading(false);
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('items')
      .update({ is_available: !currentStatus })
      .eq('id', itemId);

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_available: !currentStatus } : item
      ));
      toast({
        title: !currentStatus ? 'Item is now Available' : 'Item marked Unavailable',
        description: 'Status updated on marketplace.'
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setItems(items.filter(item => item.id !== itemId));
      toast({
        title: 'Item deleted',
        description: 'Your item has been removed from marketplace.'
      });
    }
  };

  const filteredItems = items.filter(item => {
    if (filterTab === 'available') return item.is_available ?? true;
    if (filterTab === 'unavailable') return !(item.is_available ?? true);
    return true;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">My Listed Items</h1>
            <p className="text-muted-foreground text-sm">
              Manage availability, edit details, or post new items for your community.
            </p>
          </div>
          <Button asChild className="gap-2 shadow-sm font-semibold">
            <Link to="/add-item">
              <Plus className="h-4 w-4" /> List New Item
            </Link>
          </Button>
        </div>

        {items.length > 0 && (
          <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all" className="text-xs">All Items ({items.length})</TabsTrigger>
              <TabsTrigger value="available" className="text-xs">Available ({items.filter(i => i.is_available ?? true).length})</TabsTrigger>
              <TabsTrigger value="unavailable" className="text-xs">Unavailable ({items.filter(i => !(i.is_available ?? true)).length})</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed p-8">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-1">
              {items.length === 0 ? "No items listed yet" : "No items in this category"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              {items.length === 0 
                ? "Start contributing to your local sustainable community by listing tools, electronics, or gear." 
                : "No listings match the selected availability filter."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild className="gap-2">
                <Link to="/add-item">
                  <Plus className="h-4 w-4" /> List Your First Item
                </Link>
              </Button>
              {items.length === 0 && (
                <Button 
                  variant="outline" 
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                  onClick={async () => {
                    if (!user) return;
                    setLoading(true);

                    // Fetch categories for mapping
                    const { data: cats } = await supabase.from('categories').select('id, name');
                    const getCatId = (name: string) => cats?.find(c => c.name.toLowerCase().includes(name.toLowerCase()))?.id || null;

                    const sampleItems = [
                      {
                        owner_id: user.id,
                        title: 'Bosch Professional Cordless Power Drill',
                        description: '18V Li-ion battery cordless drill with 25 torque settings and fast charger. Perfect for DIY home repairs and woodworking.',
                        condition: 'like_new',
                        location: 'Block C, Sector 62',
                        deposit_amount: 15.00,
                        max_borrow_days: 5,
                        listing_type: 'borrow',
                        is_available: true,
                        is_verified: true,
                        category_id: getCatId('tool') || getCatId('hardware'),
                        image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop'
                      },
                      {
                        owner_id: user.id,
                        title: 'Coleman 4-Person Waterproof Camping Tent',
                        description: 'Easy setup dome tent with weatherproof fly. Includes stakes, carry bag, and ground sheet. Great for weekend camping trips.',
                        condition: 'good',
                        location: 'Green Park Apartments',
                        deposit_amount: 25.00,
                        max_borrow_days: 7,
                        listing_type: 'borrow',
                        is_available: true,
                        is_verified: true,
                        category_id: getCatId('outdoor'),
                        image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop'
                      },
                      {
                        owner_id: user.id,
                        title: 'Philips HD Digital Air Fryer XL',
                        description: 'Rapid Air technology 4.1L capacity air fryer for healthy oil-free cooking. Clean and in perfect working condition.',
                        condition: 'like_new',
                        location: 'Lotus Valley Colony',
                        price: 45.00,
                        listing_type: 'sale',
                        is_available: true,
                        is_verified: true,
                        category_id: getCatId('kitchen'),
                        image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop'
                      },
                      {
                        owner_id: user.id,
                        title: 'Karcher High Pressure Electric Lawn & Patio Washer',
                        description: 'Currently reserved by neighbor. Powerful 1800W pressure washer for driveways and lawn decks.',
                        condition: 'good',
                        location: 'Sector 62 Main Gate',
                        deposit_amount: 30.00,
                        max_borrow_days: 3,
                        listing_type: 'borrow',
                        is_available: false,
                        is_verified: true,
                        category_id: getCatId('gardening') || getCatId('tool'),
                        image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=600&auto=format&fit=crop'
                      },
                      {
                        owner_id: user.id,
                        title: 'Canon EOS Rebel T7 DSLR Camera Kit',
                        description: 'Currently out on loan until next week. 24.1 MP CMOS sensor with EF-S 18-55mm IS II Lens.',
                        condition: 'like_new',
                        location: 'Green Park Apartments',
                        deposit_amount: 50.00,
                        max_borrow_days: 4,
                        listing_type: 'borrow',
                        is_available: false,
                        is_verified: true,
                        category_id: getCatId('electronics'),
                        image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop'
                      }
                    ];

                    const { error } = await supabase.from('items').insert(sampleItems);
                    if (!error) {
                      toast({ title: 'Sample Items Added! 🎉', description: '5 demo listings (including Available & Unavailable items) added.' });
                      fetchItems();
                    } else {
                      toast({ title: 'Failed to add items', description: error.message, variant: 'destructive' });
                      setLoading(false);
                    }
                  }}
                >
                  ✨ Add Sample Demo Listings
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden border hover:border-primary/40 transition-all rounded-2xl flex flex-col justify-between">
                <div>
                  <CardHeader className="p-0">
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                      {item.is_verified && (
                        <Badge className="absolute top-2 right-2 bg-blue-600 gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-bold text-base line-clamp-1">{item.title}</h3>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {item.categories && (
                        <Badge variant="secondary" className="text-[11px]">{item.categories.name}</Badge>
                      )}
                      {item.condition && (
                        <Badge variant="outline" className="text-[11px]">{conditionLabels[item.condition] || item.condition}</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {item.location}
                        </span>
                      )}
                      {item.max_borrow_days && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-primary" /> Up to {item.max_borrow_days} days
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-4 pt-0 flex flex-col gap-3 bg-muted/20 border-t mt-2">
                  <div className="flex items-center justify-between w-full pt-3">
                    <Label htmlFor={`avail-${item.id}`} className="text-xs font-semibold cursor-pointer">
                      Available for borrowing
                    </Label>
                    <Switch
                      id={`avail-${item.id}`}
                      checked={item.is_available ?? true}
                      onCheckedChange={() => toggleAvailability(item.id, item.is_available ?? true)}
                    />
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" asChild>
                      <Link to={`/edit-item/${item.id}`}>
                        <Edit className="h-3.5 w-3.5" /> Edit Listing
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive text-xs">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete item listing?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{item.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteItem(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Listing
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyItems;
