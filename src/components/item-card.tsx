
"use client";

import React from 'react';
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

const ItemCard: React.FC<ItemCardProps> = ({ item, priority = false }) => {
  const { toast } = useToast();
  const { addToBag } = useBagContext();
  
  const hasDiscount = typeof item.discount === 'number' && item.discount > 0;

  const handleAddToBag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addToBag(item);
    toast({
      title: "Added to Bag!",
      description: `${item.title} has been added to your shopping bag.`,
      variant: "default",
    });
  };
  
  const safeImageUrl = item.imageUrls?.[0] || 'https://placehold.co/600x800.png';

  return (
    <Link href={`/item/${item.id}`} className="outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg" aria-label={`View details for ${item.title}`}>
      <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group hover:-translate-y-1">
        <CardHeader className="p-0 relative">
          <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
            <Image
              src={safeImageUrl}
              alt={item.title}
              fill={true}
              className="object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={item.imageHints?.[0] || "clothing item"}
              priority={priority}
            />
          </div>
          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-3 right-3">
              {item.discount}% OFF
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow space-y-2">
          <h2 className="text-lg font-semibold leading-tight" title={`${item.title} (Sizes: ${item.size}) (Colors: ${item.colors})`}>
            {item.title} <span className="text-sm font-normal text-muted-foreground">({item.size})</span>
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-2" title={item.description}>
            {item.description}
          </p>
          <div className="flex items-center justify-between text-sm pt-1">
            <p className="text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full">{item.category}</p>
            <div className="flex items-baseline gap-2">
              {hasDiscount && (
                <p className="text-muted-foreground line-through text-xs">
                  ₹{item.price.toFixed(2)}
                </p>
              )}
              <p className="font-medium text-primary">
                ₹{item.finalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t mt-auto">
          <Button
            onClick={handleAddToBag}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label={`Add ${item.title} to bag`}
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> Add to Bag
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default React.memo(ItemCard);
