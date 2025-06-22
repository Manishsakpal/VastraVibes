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
  const { items } = useItemContext();
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState(items.find(p => p.id === id));


  // Set the document title dynamically since we can't use generateMetadata in a Client Component
  useEffect(() => {
    const currentItem = items.find(p => p.id === id);
    if (currentItem) {
      setItem(currentItem);
      document.title = `${currentItem.title} | Vastra Vibes`;
    }
  }, [id, items]);

  if (!item) {
    // Show a skeleton while the context might still be hydrating from localstorage
    // or if the item genuinely doesn't exist before notFound is triggered.
    const itemExistsInCurrentList = items.some(p => p.id === id);
    if (!itemExistsInCurrentList && items.length > 0) {
      notFound();
    }
    return <ItemDetailSkeleton />;
  }

  return <ItemDetailClient item={item} />;
}
