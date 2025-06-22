"use client";

import { useState, useMemo, useEffect } from 'react';
import type { ClothingItem, Category } from '@/types';
import ItemCard from '@/components/item-card';
import CategorySelector from '@/components/category-selector';
import { CATEGORIES, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ItemListProps {
  items: ClothingItem[];
}

export default function ItemList({ items }: ItemListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedItems, setSortedItems] = useState<ClothingItem[]>(items);

  useEffect(() => {
    // This effect runs on the client after hydration to sort items based on purchase counts.
    try {
      const storedCounts = localStorage.getItem(PURCHASE_COUNTS_STORAGE_KEY);
      if (storedCounts) {
        const counts: Record<string, number> = JSON.parse(storedCounts);
        const newSortedItems = [...items].sort((a, b) => {
          const countA = counts[a.id] || 0;
          const countB = counts[b.id] || 0;
          return countB - countA; // Sort descending by purchase count
        });
        setSortedItems(newSortedItems);
      }
    } catch (error) {
      console.warn("Could not read purchase counts for sorting:", error);
      // Fallback to original item order if there's an error
      setSortedItems(items);
    }
  }, [items]);

  const filteredItems = useMemo(() => {
    let tempItems = sortedItems;
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
  }, [sortedItems, selectedCategory, searchTerm]);

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
