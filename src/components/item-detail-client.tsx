
"use client";

import { useState, useEffect } from 'react';
import type { ClothingItem } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBagContext } from '@/context/bag-context';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

export default function ItemDetailClient({ item }: { item: ClothingItem }) {
  // We trust item.imageUrls is sanitized at the context level.
  const [selectedImage, setSelectedImage] = useState(item.imageUrls?.[0] || '');
  const { addToBag } = useBagContext();
  const { toast } = useToast();
  
  // Update the selected image if the item prop changes (e.g., navigating between item pages)
  useEffect(() => {
    setSelectedImage(item.imageUrls?.[0] || '');
  }, [item]);

  const safeImageUrls = item.imageUrls || [];

  if (safeImageUrls.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-8 gap-4 animate-fade-in-up">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Images Not Available</h1>
        <p className="text-muted-foreground">We're sorry, but the images for this product could not be loaded.</p>
      </Card>
    )
  }

  const hasDiscount = typeof item.discount === 'number' && item.discount > 0;

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
          {selectedImage && (
            <Image
              src={selectedImage}
              alt={item.title}
              fill={true}
              className="object-contain transition-all duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          )}
        </div>
        {safeImageUrls.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {safeImageUrls.map((imgUrl, index) => (
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
                  fill={true}
                  className="object-contain"
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
          <p className="text-lg text-muted-foreground mt-4">{item.description}</p>
        </div>

        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-bold">₹{item.finalPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-2xl text-muted-foreground line-through">₹{item.price.toFixed(2)}</span>
          )}
           {hasDiscount && (
            <Badge variant="destructive" className="text-md">{item.discount}% OFF</Badge>
          )}
        </div>
        
        <div className="space-y-4 border-t pt-4">
            <div className="space-y-1">
                <h3 className="font-semibold text-base">Available Sizes</h3>
                <p className="text-muted-foreground text-sm">{item.size}</p>
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-base">Available Colors</h3>
                <p className="text-muted-foreground text-sm">{item.colors}</p>
            </div>
        </div>

        <div className="pt-4">
            <Button size="lg" className="w-full" onClick={handleAddToBag}>
                <ShoppingBag className="mr-2 h-5 w-5" /> Add to Bag
            </Button>
        </div>

        {item.specifications && item.specifications.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-semibold">Specifications</h3>
            <ul className="space-y-2">
              {item.specifications.map((spec, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2 pt-2">
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
