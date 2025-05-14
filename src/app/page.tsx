"use client";

import type { NextPage } from 'next';
import { useState, useMemo, useEffect } from 'react';
import { useItemContext } from '@/context/item-context';
import type { ClothingItem, Category } from '@/types';
import ItemCard from '@/components/item-card';
import CategorySelector from '@/components/category-selector';
import { CATEGORIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const HomePage: NextPage = () => {
  const { items } = useItemContext();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = useMemo(() => {
    let tempItems = items;
    if (selectedCategory !== 'All') {
      tempItems = tempItems.filter(item => item.category === selectedCategory);
    }
    if (searchTerm) {
      tempItems = tempItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return tempItems;
  }, [items, selectedCategory, searchTerm]);

  if (!mounted) {
    // Render a loading state or skeleton screen
    return (
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
  }

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary tracking-tight">Welcome to Vastra Vibes</h1>
        <p className="text-lg text-muted-foreground">Discover Your Unique Style</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <CategorySelector
          categories={['All', ...CATEGORIES]}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <div className="relative w-full sm:w-auto sm:flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <section aria-labelledby="clothing-items-section">
          <h2 id="clothing-items-section" className="sr-only">Clothing Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {searchTerm ? "No items match your search." : `No items found in ${selectedCategory === 'All' ? 'this category' : selectedCategory}.`}
          </p>
          {/* Optionally, suggest clearing filters or checking back later */}
        </div>
      )}
    </div>
  );
};

export default HomePage;
