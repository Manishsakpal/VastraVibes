
"use client";

import { useItemContext } from '@/context/item-context';
import { useParams, notFound } from 'next/navigation';
import { useEffect } from 'react';
import ItemDetailClient from '@/components/item-detail-client';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

// Note: Since this page is now a Client Component to handle dynamic data,
// the generateMetadata function is no longer used by Next.js.
// The document title is set dynamically in the component using useEffect.

export default function ItemDetailPage() {
  const { items, isLoading } = useItemContext();
  const params = useParams();
  const id = params.id as string;

  // Find the item from the client-side context
  const item = items.find(p => p.id === id);

  useEffect(() => {
    if (item) {
      document.title = `${item.title} | Vastra Vibes`;
    } else if (!isLoading) {
      document.title = 'Item Not Found | Vastra Vibes';
    }
  }, [item, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Item...</p>
      </div>
    );
  }

  if (!item) {
    // This will render the not-found.js file in the root if it exists,
    // or a default Next.js 404 page.
    notFound();
  }

  return <ItemDetailClient item={item} />;
}
