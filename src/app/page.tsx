import type { NextPage } from 'next';
import ItemList from '@/components/item-list';
import { getItems } from '@/lib/data';

const HomePage: NextPage = () => {
  const items = getItems();

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary tracking-tight">Welcome to Vastra Vibes</h1>
        <p className="text-lg text-muted-foreground">Discover Your Unique Style</p>
      </header>
      
      <ItemList initialItems={items} />
    </div>
  );
};

export default HomePage;
