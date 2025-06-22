import type { NextPage } from 'next';
import ItemList from '@/components/item-list';
import { initialItems } from '@/lib/mock-data';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HomePage: NextPage = () => {
  // In a real application, this data would be fetched from a database.
  // For this demo, we are reading it from a static file on the server.
  const items = initialItems;

  const ItemListSkeleton = () => (
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-10 bg-muted rounded-md w-1/3 mb-4"></div>
        <div className="h-12 bg-muted rounded-md w-full mb-6"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card p-4 rounded-lg shadow-md space-y-3">
            <div className="h-48 bg-muted rounded-md"></div>
            <div className="h-6 bg-muted rounded-md w-3/4"></div>
            <div className="h-4 bg-muted rounded-md w-1/2"></div>
            <div className="h-10 bg-muted rounded-md w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary tracking-tight">Welcome to Vastra Vibes</h1>
        <p className="text-lg text-muted-foreground">Discover Your Unique Style</p>
      </header>
      
      <Suspense fallback={<ItemListSkeleton />}>
        <ItemList items={items} />
      </Suspense>
    </div>
  );
};

export default HomePage;
