"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ClothingItem, Category } from '@/types';
import ItemCard from '@/components/item-card';
import CategorySelector from '@/components/category-selector';
import { CATEGORIES, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

interface ItemListProps {
  items: ClothingItem[];
}

const ITEMS_PER_PAGE = 16;
const ITEMS_TO_LOAD_ON_SCROLL = 8;

export default function ItemList({ items }: ItemListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedItems, setSortedItems] = useState<ClothingItem[]>(items);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const storedCounts = localStorage.getItem(PURCHASE_COUNTS_STORAGE_KEY);
      if (storedCounts) {
        const counts: Record<string, number> = JSON.parse(storedCounts);
        const newSortedItems = [...items].sort((a, b) => {
          const countA = counts[a.id] || 0;
          const countB = counts[b.id] || 0;
          return countB - countA;
        });
        setSortedItems(newSortedItems);
      } else {
        setSortedItems(items);
      }
    } catch (error) {
      console.warn("Could not read purchase counts for sorting:", error);
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
  
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchTerm]);
  
  const itemsToDisplay = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && itemsToDisplay.length < filteredItems.length) {
      setDisplayCount((prevCount) => prevCount + ITEMS_TO_LOAD_ON_SCROLL);
    }
  }, [itemsToDisplay.length, filteredItems.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "400px", // Start loading 400px before the element is visible
      threshold: 0,
    });

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [handleObserver]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
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

      {itemsToDisplay.length > 0 ? (
        <>
          <section aria-labelledby="clothing-items-section">
            <h2 id="clothing-items-section" className="sr-only">Clothing Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
              {itemsToDisplay.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <div className="flex justify-center items-center py-10" ref={loaderRef}>
            {itemsToDisplay.length < filteredItems.length && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
          </div>
        </>
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
