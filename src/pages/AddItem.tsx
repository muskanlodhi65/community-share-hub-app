import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Tag, RefreshCw } from 'lucide-react';


interface Category {
  id: string;
  name: string;
}

const AddItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [maxBorrowDays, setMaxBorrowDays] = useState('7');
  const [listingType, setListingType] = useState<'borrow' | 'sale'>('borrow');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your item.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('items').insert({
      owner_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
      condition: condition || null,
      location: location.trim() || null,
      image_url: imageUrl.trim() || null,
      listing_type: listingType,
      price: listingType === 'sale' && price ? parseFloat(price) : null,
      deposit_amount: listingType === 'borrow' && depositAmount ? parseFloat(depositAmount) : 0,
      max_borrow_days: listingType === 'borrow' ? (parseInt(maxBorrowDays) || 7) : null
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Failed to add item',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Item added!',
        description: 'Your item is now available for borrowing.'
      });
      navigate('/my-items');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>List a New Item</CardTitle>
                <CardDescription>Share your item with the community</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <div className="grid w-full grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={listingType === 'borrow' ? 'default' : 'outline'}
                    onClick={() => setListingType('borrow')}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" /> For Borrowing
                  </Button>
                  <Button
                    type="button"
                    variant={listingType === 'sale' ? 'default' : 'outline'}
                    onClick={() => setListingType('sale')}
                    className="gap-2"
                  >
                    <Tag className="h-4 w-4" /> For Sale
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Item Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., DeWalt Power Drill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item, its features, and any usage instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Building A, Campus North"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              {listingType === 'sale' ? (
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Buyers will contact you directly to arrange payment</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Security Deposit ($)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDays">Max Borrow Days</Label>
                    <Input
                      id="maxDays"
                      type="number"
                      min="1"
                      max="30"
                      value={maxBorrowDays}
                      onChange={(e) => setMaxBorrowDays(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Item...
                    </>
                  ) : (
                    'Add Item'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AddItem;
