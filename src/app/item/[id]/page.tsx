import { initialItems } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import ItemDetailClient from '@/components/item-detail-client';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  params: { id: string };
};

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = initialItems.find(i => i.id === params.id);
  
  if (!item || !item.imageUrls || item.imageUrls.length === 0) {
    return {
      title: "Item Not Found",
      description: "The product you are looking for does not exist."
    };
  }

  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      images: [
        {
          url: item.imageUrls[0],
          width: 600,
          height: 800,
          alt: item.title,
        },
      ],
    },
     twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: [item.imageUrls[0]],
    },
  };
}

export default function ItemDetailPage({ params }: Props) {
  // In a real app, you would fetch data here based on the ID.
  // For this demo, we find it in the static data.
  const item = initialItems.find(p => p.id === params.id);

  if (!item) {
    notFound();
  }

  return (
    <Suspense fallback={<ItemDetailSkeleton />}>
        <ItemDetailClient item={item} />
    </Suspense>
  );
}

// Statically generate routes for all items for better performance
export async function generateStaticParams() {
  return initialItems.map((item) => ({
    id: item.id,
  }));
}
