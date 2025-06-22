"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ClothingItem, Category } from '@/types';
import ItemCard from '@/components/item-card';
import CategorySelector from '@/components/category-selector';
import { CATEGORIES, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search, Loader2, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/context/theme-context';

interface ItemListProps {
  items: ClothingItem[];
}

const ITEMS_PER_PAGE = 16;
const ITEMS_TO_LOAD_ON_SCROLL = 8;

export default function ItemList({ items }: ItemListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('popular');
  const [purchaseCounts, setPurchaseCounts] = useState<Record<string, number>>({});
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { setThemeByCategory } = useTheme();

  useEffect(() => {
    try {
      const storedCounts = localStorage.getItem(PURCHASE_COUNTS_STORAGE_KEY);
      if (storedCounts) {
        setPurchaseCounts(JSON.parse(storedCounts));
      }
    } catch (error) {
      console.warn("Could not read purchase counts for sorting:", error);
    }
  }, []);

  const handleSelectCategory = (category: Category | 'All') => {
    setSelectedCategory(category);
    setThemeByCategory(category);
  };

  const filteredAndSortedItems = useMemo(() => {
    let tempItems = [...items];

    // Filtering
    if (selectedCategory !== 'All') {
      tempItems = tempItems.filter(item => item.category === selectedCategory);
    }
    if (searchTerm) {
      tempItems = tempItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        tempItems.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        tempItems.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case 'newest':
        tempItems.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'popular':
      default:
        tempItems.sort((a, b) => {
          const countA = purchaseCounts[a.id] || 0;
          const countB = purchaseCounts[b.id] || 0;
          return countB - countA;
        });
        break;
    }

    return tempItems;
  }, [items, selectedCategory, searchTerm, sortOption, purchaseCounts]);
  
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchTerm, sortOption]);
  
  const itemsToDisplay = useMemo(() => {
    return filteredAndSortedItems.slice(0, displayCount);
  }, [filteredAndSortedItems, displayCount]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && itemsToDisplay.length < filteredAndSortedItems.length) {
      setDisplayCount((prevCount) => prevCount + ITEMS_TO_LOAD_ON_SCROLL);
    }
  }, [itemsToDisplay.length, filteredAndSortedItems.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "400px",
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

  // When the component mounts, set the theme based on the initial or last-selected category.
  // This handles returning to the page and keeping the theme consistent.
  useEffect(() => {
    setThemeByCategory(selectedCategory);
  }, [selectedCategory, setThemeByCategory]);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 items-center mb-8">
        <div className="w-full flex-grow">
          <CategorySelector
            categories={['All', ...CATEGORIES]}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-shrink-0">
          <div className="relative w-full sm:w-auto sm:flex-grow max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
             <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popularity</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {itemsToDisplay.length > 0 ? (
        <>
          <section aria-labelledby="clothing-items-section">
            <h2 id="clothing-items-section" className="sr-only">Clothing Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
              {itemsToDisplay.map((item, index) => (
                <ItemCard key={item.id} item={item} priority={index < 4} />
              ))}
            </div>
          </section>

          <div className="flex justify-center items-center py-10" ref={loaderRef}>
            {itemsToDisplay.length < filteredAndSortedItems.length && (
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
