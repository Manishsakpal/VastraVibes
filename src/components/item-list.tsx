"use client";

import { useState, useMemo } from 'react';
import type { ClothingItem, Category } from '@/types';
import ItemCard from '@/components/item-card';
import CategorySelector from '@/components/category-selector';
import { CATEGORIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ItemListProps {
  items: ClothingItem[];
}

export default function ItemList({ items }: ItemListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <>
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
        </div>
      )}
    </>
  );
}
