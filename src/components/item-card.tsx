
"use client";

import React, { useCallback } from 'react';
import Image from 'next/image';
import type { ClothingItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBagContext } from '@/context/bag-context';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ItemCardProps {
  item: ClothingItem;
  priority?: boolean;
}

const ItemCard = React.forwardRef<HTMLAnchorElement, ItemCardProps>(({ item, priority = false }, ref) => {
  const { toast } = useToast();
  const { addToBag } = useBagContext();
  
  const hasDiscount = typeof item.discount === 'number' && item.discount > 0;

  const handleAddToBag = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addToBag(item);
    toast({
      title: "Added to Bag!",
      description: `${item.title} has been added to your shopping bag.`,
      variant: "default",
    });
  }, [addToBag, item, toast]);
  
  const safeImageUrl = item.imageUrls?.[0] || 'https://placehold.co/600x800.png';

  return (
    <Link ref={ref} href={`/item/${item.id}`} className="outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg group block h-full" aria-label={`View details for ${item.title}`}>
      <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="aspect-[3/4] w-full overflow-hidden bg-white relative">
            <Image
              src={safeImageUrl}
              alt={item.title}
              fill={true}
              className="object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              data-ai-hint={item.imageHints?.[0] || "clothing item"}
              priority={priority}
            />
            {hasDiscount && (
              <Badge variant="destructive" className="absolute top-2 left-2">
                {item.discount}% OFF
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <div>
            <h2 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h2>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p className="truncate" title={item.size}>
                <span className="font-medium text-foreground/80">Sizes:</span> {item.size}
              </p>
              <p className="truncate" title={item.colors}>
                <span className="font-medium text-foreground/80">Colors:</span> {item.colors}
              </p>
            </div>
          </div>
          
          <div className="flex-grow" />
          
          <div className="flex items-baseline gap-2 pt-4">
            {hasDiscount && (
              <p className="text-muted-foreground line-through text-sm">
                ₹{item.price.toFixed(2)}
              </p>
            )}
            <p className="text-xl font-bold text-primary">
              ₹{item.finalPrice.toFixed(2)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-2 border-t mt-auto">
          <Button
            onClick={handleAddToBag}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label={`Add ${item.title} to bag`}
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> Add to Bag
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
});

ItemCard.displayName = "ItemCard";

export default React.memo(ItemCard);
