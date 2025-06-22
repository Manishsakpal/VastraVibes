"use client";

import Image from 'next/image';
import type { ClothingItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBagContext } from '@/context/bag-context';

interface ItemCardProps {
  item: ClothingItem;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { toast } = useToast();
  const { addToBag } = useBagContext();

  const handleAddToBag = () => {
    addToBag(item);
    toast({
      title: "Added to Bag!",
      description: `${item.title} has been added to your shopping bag.`,
      variant: "default",
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <div className="aspect-[3/4] relative w-full overflow-hidden bg-muted">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill={true}
            style={{objectFit: 'cover'}}
            className="transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={item.imageHint || "clothing item"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-2">
        <h2 className="text-lg font-semibold leading-tight truncate" title={item.title}>
          {item.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-2" title={item.description}>
          {item.description}
        </p>
        <div className="flex items-center justify-between text-sm pt-1">
          <p className="text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full">{item.category}</p>
          <p className="font-medium text-primary">
            ₹{item.price.toFixed(2)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Sizes: {item.size}</p>
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
  );
};

export default ItemCard;
