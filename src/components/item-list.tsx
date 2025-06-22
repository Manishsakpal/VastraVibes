
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { ClothingItem, Category } from '@/types';
import ItemCard from '@/components/item-card';
import CategorySelector from '@/components/category-selector';
import { CATEGORIES, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search, Loader2, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/context/theme-context';
import { useItemContext } from '@/context/item-context';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { themeToCategory, categoryToTheme } from '@/context/theme-context';


const ITEMS_PER_PAGE = 8;
const ITEMS_TO_LOAD_ON_SCROLL = 8;

const ItemCardSkeleton = () => (
    <div className="flex flex-col overflow-hidden h-full rounded-lg border bg-card">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="p-4 flex-grow space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="p-4 border-t">
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);

const ItemListControlsSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-4 items-center mb-8">
    <div className="w-full flex-grow">
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-shrink-0">
      <div className="relative w-full sm:w-auto sm:flex-grow max-w-sm">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="w-full sm:w-48">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

const ItemListSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
    {[...Array(ITEMS_PER_PAGE)].map((_, i) => <ItemCardSkeleton key={i} />)}
  </div>
);


function ItemList() {
  const { items, isLoading } = useItemContext();
  const { theme, setTheme } = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortOption, setSortOption] = useState('popular');
  const [purchaseCounts, setPurchaseCounts] = useState<Record<string, number>>({});
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const selectedCategory = useMemo(() => themeToCategory(theme), [theme]);

  const handleCategorySelect = useCallback((category: Category | 'All') => {
    setTheme(categoryToTheme(category));
  }, [setTheme]);

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

  const filteredAndSortedItems = useMemo(() => {
    let tempItems = [...items];

    if (selectedCategory !== 'All') {
      tempItems = tempItems.filter(item => item.category === selectedCategory);
    }
    
    if (debouncedSearchTerm) {
        const searchWords = debouncedSearchTerm.toLowerCase().split(' ').filter(Boolean);
        
        const scoredItems = tempItems.map(item => {
            const matchScore = searchWords.reduce((score, word) => {
                return item.searchableText.includes(word) ? score + 1 : score;
            }, 0);
            return { ...item, matchScore };
        }).filter(item => item.matchScore > 0);

        scoredItems.sort((a, b) => {
            if (a.matchScore !== b.matchScore) {
                return b.matchScore - a.matchScore;
            }
            
            // Tie-breaker sorting
            switch (sortOption) {
                case 'price-asc':
                    return a.finalPrice - b.finalPrice;
                case 'price-desc':
                    return b.finalPrice - a.finalPrice;
                case 'newest':
                    return parseInt(b.id) - parseInt(a.id);
                case 'popular':
                default:
                    const countA = purchaseCounts[a.id] || 0;
                    const countB = purchaseCounts[b.id] || 0;
                    return countB - countA;
            }
        });
        
        return scoredItems;
    }

    // Default sorting when no search term
    switch (sortOption) {
      case 'price-asc':
        tempItems.sort((a, b) => a.finalPrice - b.finalPrice);
        break;
      case 'price-desc':
        tempItems.sort((a, b) => b.finalPrice - a.finalPrice);
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
  }, [items, selectedCategory, debouncedSearchTerm, sortOption, purchaseCounts]);
  
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [selectedCategory, debouncedSearchTerm, sortOption]);
  
  const itemsToDisplay = useMemo(() => {
    return filteredAndSortedItems.slice(0, displayCount);
  }, [filteredAndSortedItems, displayCount]);

  const observer = useRef<IntersectionObserver>();
  const lastItemRef = useCallback((node: HTMLAnchorElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
  
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && displayCount < filteredAndSortedItems.length) {
          setDisplayCount(prevCount => prevCount + ITEMS_TO_LOAD_ON_SCROLL);
        }
      });
  
      if (node) observer.current.observe(node);
    },
    [isLoading, displayCount, filteredAndSortedItems.length]
  );
  
  if (isLoading) {
    return (
      <>
        <ItemListControlsSkeleton />
        <ItemListSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 items-center mb-8">
        <div className="w-full flex-grow">
          <CategorySelector
            categories={['All', ...CATEGORIES]}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-shrink-0">
          <div className="relative w-full sm:w-auto sm:flex-grow max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products, colors, sizes..."
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
              {itemsToDisplay.map((item, index) => {
                const isLast = itemsToDisplay.length === index + 1;
                return (
                  <ItemCard
                    ref={isLast ? lastItemRef : null}
                    key={item.id}
                    item={item}
                    priority={index < 4}
                  />
                );
              })}
            </div>
          </section>
          
          <div className="flex justify-center items-center py-10">
            {displayCount < filteredAndSortedItems.length && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {debouncedSearchTerm ? "No items match your search." : `No items found in ${selectedCategory === 'All' ? 'this category' : selectedCategory}.`}
          </p>
        </div>
      )}
    </>
  );
}

export default React.memo(ItemList);
