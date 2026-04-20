import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { ItemCard } from '@/components/items/ItemCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Package, X, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ItemWithDetails {
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
  created_at?: string;
  categories: { name: string } | null;
  owner_id: string;
}

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [listingTypeFilter, setListingTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [availableOnly, setAvailableOnly] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchItems = async () => {
    setLoading(true);
    
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
        listing_type,
        price,
        created_at,
        owner_id,
        categories (name)
      `)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setItems(data as unknown as ItemWithDetails[]);
    }
    setLoading(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setListingTypeFilter('all');
    setSortBy('newest');
    setAvailableOnly(false);
    setSearchParams({});
  };

  // Active filters count
  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCondition !== 'all' ? 1 : 0) +
    (listingTypeFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0) +
    (availableOnly ? 1 : 0);

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      if (searchQuery && 
          !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.location?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'all' && item.categories?.name !== selectedCategory) {
        return false;
      }
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
        return false;
      }
      if (listingTypeFilter !== 'all' && item.listing_type !== listingTypeFilter) {
        return false;
      }
      if (availableOnly && !item.is_available) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      // default: newest
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Browse Marketplace</h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              Discover tools, equipment, books, and resources shared by trusted members in your local community.
            </p>
          </div>

          <Button onClick={() => fetchItems()} variant="outline" size="sm" className="gap-2 shrink-0">
            <RotateCcw className="h-3.5 w-3.5" /> Refresh Listings
          </Button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedCategory('all');
              setSearchParams({});
            }}
            className="rounded-full text-xs font-semibold shrink-0"
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.name ? 'default' : 'outline'}
              onClick={() => {
                setSelectedCategory(cat.name);
                setSearchParams({ category: cat.name });
              }}
              className="rounded-full text-xs font-medium shrink-0"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 rounded-2xl bg-card border shadow-xs mb-8 space-y-4">
          {/* Top Row: Search & Listing Tabs */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search input with clear button */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items, tools, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Listing Type Filter Tabs */}
            <Tabs defaultValue="all" value={listingTypeFilter} onValueChange={setListingTypeFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="all" className="text-xs">All Types</TabsTrigger>
                <TabsTrigger value="borrow" className="text-xs">Borrowing 🤝</TabsTrigger>
                <TabsTrigger value="sale" className="text-xs">For Sale 🏷️</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Bottom Row: Condition, Sort, Availability & Reset */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-xs">
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Filters:
            </div>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Condition</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 text-xs w-[150px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant={availableOnly ? "default" : "outline"}
              onClick={() => setAvailableOnly(!availableOnly)}
              className="h-8 text-xs rounded-lg"
            >
              {availableOnly ? 'Available Only' : 'Show All'}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={resetFilters}
                className="h-8 text-xs text-destructive hover:text-destructive gap-1 ml-auto"
              >
                <X className="h-3.5 w-3.5" /> Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
          <p>
            Showing <strong className="text-foreground font-semibold">{filteredItems.length}</strong> items
          </p>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {activeFiltersCount} filter(s) applied
            </Badge>
          )}
        </div>

        {/* Items Grid with Shimmer Skeleton Loading */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl border bg-card p-4 space-y-4">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed p-8">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-1">No matching items found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Try adjusting your search terms or clearing selected filters to view more listings.
            </p>
            <Button onClick={resetFilters} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
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
        )}
      </div>
    </MainLayout>
  );
};

export default Browse;
