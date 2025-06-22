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
  const { items, isSyncing } = useItemContext();
  const params = useParams();
  const id = params.id as string;

  // Set the document title dynamically since we can't use generateMetadata in a Client Component
  useEffect(() => {
    const currentItem = items.find(p => p.id === id);
    if (currentItem) {
      document.title = `${currentItem.title} | Vastra Vibes`;
    }
  }, [id, items]);

  if (isSyncing) {
    return <ItemDetailSkeleton />;
  }

  const item = items.find(p => p.id === id);

  if (!item) {
    // This will render the not-found.tsx file if it exists, or a default Next.js 404 page
    notFound();
  }

  return <ItemDetailClient item={item} />;
}
