import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, CheckCircle2, Package, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface ItemCardProps {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  condition: string | null;
  isAvailable: boolean;
  isVerified: boolean;
  location: string | null;
  categoryName: string | null;
  ownerName: string | null;
  maxBorrowDays: number | null;
  listingType?: string;
  price?: number | null;
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
};

const conditionColors: Record<string, string> = {
  new: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300/40',
  like_new: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-300/40',
  good: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300/40',
  fair: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300/40',
  poor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300/40'
};

export const ItemCard = ({
  id,
  title,
  description,
  imageUrl,
  condition,
  isAvailable,
  isVerified,
  location,
  categoryName,
  ownerName,
  maxBorrowDays,
  listingType = 'borrow',
  price
}: ItemCardProps) => {
  const isSale = listingType === 'sale';
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-primary/40 flex flex-col justify-between rounded-2xl bg-card">
      <div>
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-900/30">
            {imageUrl && imageUrl.trim() !== '' && !imgError ? (
              <img
                src={imageUrl}
                alt={title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-primary/10 dark:from-emerald-950/60 dark:to-teal-900/50">
                <div className="p-3 rounded-2xl bg-background/80 shadow-xs border border-primary/20 mb-2">
                  <Package className="h-10 w-10 text-primary" />
                </div>
                <span className="text-xs font-bold text-foreground/80 tracking-wide line-clamp-1 px-2">{title}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Community Resource</span>
              </div>
            )}
            
            {/* Top Badge Overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
              {isSale ? (
                <Badge className="bg-emerald-600 dark:bg-emerald-500 text-white gap-1 font-semibold text-xs shadow-xs">
                  <Tag className="h-3 w-3" /> For Sale
                </Badge>
              ) : (
                <Badge className="bg-primary/90 text-primary-foreground gap-1 font-semibold text-xs shadow-xs">
                  🤝 Borrow
                </Badge>
              )}
              {!isAvailable && (
                <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs font-medium">
                  {isSale ? 'Sold' : 'Unavailable'}
                </Badge>
              )}
              {isVerified && (
                <Badge className="bg-blue-600/90 text-white gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>

            {categoryName && (
              <Badge 
                variant="outline" 
                className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-xs text-xs font-medium border-border/60"
              >
                {categoryName}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description || 'No detailed description provided by owner.'}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
            {isSale && price ? (
              <div className="text-lg font-extrabold text-primary">
                ${price.toFixed(2)}
              </div>
            ) : maxBorrowDays ? (
              <div className="flex items-center gap-1 text-muted-foreground font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Max {maxBorrowDays} Days
              </div>
            ) : null}

            {condition && (
              <Badge variant="outline" className={`text-[11px] py-0.5 px-2 font-medium ${conditionColors[condition] || ''}`}>
                {conditionLabels[condition] || condition}
              </Badge>
            )}
          </div>

          {location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-4 pt-2 border-t border-border/40 flex items-center justify-between bg-muted/20">
        <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
          {ownerName ? `by ${ownerName}` : 'Verified Member'}
        </span>
        <Button asChild size="sm" variant={isAvailable ? "default" : "secondary"} disabled={!isAvailable} className="gap-1 text-xs shadow-xs">
          <Link to={`/item/${id}`}>
            {isAvailable ? 'Details' : 'Unavailable'}
            {isAvailable && <ArrowRight className="h-3 w-3" />}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
