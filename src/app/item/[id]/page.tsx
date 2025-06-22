"use client";

import { useItemContext } from '@/context/item-context';
import { useParams, notFound } from 'next/navigation';
import ItemDetailClient from '@/components/item-detail-client';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Item Detail Skeleton
const ItemDetailSkeleton = () => (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="grid grid-cols-5 gap-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-md" />)}
            </div>
        </div>
        <div className="space-y-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-12 w-full" />
        </div>
    </div>
);

export default function ItemDetailPage() {
  const { items, isLoading } = useItemContext();
  const params = useParams();
  const id = params.id as string;
  
  const item = items.find(p => p.id === id);

  // Set the document title dynamically once the item is available
  useEffect(() => {
    if (item) {
      document.title = `${item.title} | Vastra Vibes`;
    }
  }, [item]);

  if (isLoading) {
    return <ItemDetailSkeleton />;
  }

  if (!item) {
    // If loading is finished and we still don't have an item, it's a 404
    notFound();
  }

  return <ItemDetailClient item={item} />;
}
