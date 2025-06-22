"use client";

import { useState } from 'react';
import type { ClothingItem } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBagContext } from '@/context/bag-context';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ItemDetailClient({ item }: { item: ClothingItem }) {
  const [selectedImage, setSelectedImage] = useState(item.imageUrls[0]);
  const { addToBag } = useBagContext();
  const { toast } = useToast();

  const hasDiscount = item.discount && item.discount > 0;
  const discountedPrice = hasDiscount ? item.price * (1 - item.discount! / 100) : item.price;

  const handleAddToBag = () => {
    addToBag(item);
    toast({
      title: "Added to Bag!",
      description: `${item.title} has been added to your shopping bag.`,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 animate-fade-in-up">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-[3/4] w-full bg-muted rounded-lg overflow-hidden shadow-lg">
          <Image
            src={selectedImage}
            alt={item.title}
            fill
            className="object-cover transition-all duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        {item.imageUrls.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {item.imageUrls.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(imgUrl)}
                className={cn(
                  'relative aspect-square w-full rounded-md overflow-hidden transition-all ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring',
                  selectedImage === imgUrl ? 'ring-2 ring-primary' : 'hover:opacity-80'
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={imgUrl}
                  alt={`${item.title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="20vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="space-y-6">
        <div>
          <Badge>{item.category}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-primary mt-2">{item.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{item.description}</p>
        </div>

        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-bold">₹{discountedPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-2xl text-muted-foreground line-through">₹{item.price.toFixed(2)}</span>
          )}
           {hasDiscount && (
            <Badge variant="destructive" className="text-md">{item.discount}% OFF</Badge>
          )}
        </div>
        
        <div className="space-y-2">
            <h3 className="font-semibold">Available Sizes</h3>
            <p className="text-muted-foreground">{item.size}</p>
        </div>

        <div className="pt-4">
            <Button size="lg" className="w-full" onClick={handleAddToBag}>
                <ShoppingBag className="mr-2 h-5 w-5" /> Add to Bag
            </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Quality Assured Fabric</span>
            </div>
            <div className="flex items-center gap-2">
                 <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Easy 7-Day Returns</span>
            </div>
        </div>
      </div>
    </div>
  );
}
