
"use client";

import type { ClothingItem, CartItem } from '@/types';
import { initialItems as rawInitialItems } from '@/lib/mock-data';
import { ITEMS_STORAGE_KEY, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sanitizeItems } from '@/lib/utils';

// Helper function to add performance-optimized fields
const processRawItems = (items: Omit<ClothingItem, 'finalPrice' | 'searchableText'>[]): ClothingItem[] => {
  return items.map(item => {
    const finalPrice = (item.discount && item.discount > 0)
      ? item.price * (1 - item.discount / 100)
      : item.price;

    const searchableText = [
      item.title,
      item.description,
      item.colors,
      item.size,
    ].join(' ').toLowerCase();

    // The type assertion is safe because we are adding the missing properties.
    return { ...item, finalPrice, searchableText } as ClothingItem;
  });
};

interface ItemContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>) => void;
  deleteItem: (itemId: string) => void;
  recordPurchase: (purchasedItems: CartItem[]) => void;
  isLoading: boolean;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedItemsRaw = localStorage.getItem(ITEMS_STORAGE_KEY);
      
      if (storedItemsRaw) {
        // If items are in storage, use them as the source of truth.
        const storedItemsParsed = JSON.parse(storedItemsRaw);
        if (Array.isArray(storedItemsParsed)) {
          const processedItems = processRawItems(sanitizeItems(storedItemsParsed));
          setItems(processedItems);
        } else {
          // Handle corrupted data in storage by falling back to initial data.
          throw new Error("Stored items are not an array.");
        }
      } else {
        // If storage is empty, this is the first visit.
        // Process the initial mock data and populate storage for subsequent visits.
        const sanitizedInitialItems = sanitizeItems(rawInitialItems);
        const processedInitialItems = processRawItems(sanitizedInitialItems);
        
        setItems(processedInitialItems);
        
        // Save the raw initial items to storage to act as a cache.
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(sanitizedInitialItems));
      }
    } catch (error) {
      console.warn("Could not read from localStorage, falling back to initial data:", error);
      // Fallback in case of any error (e.g., parsing, corrupted data)
      const sanitizedInitialItems = sanitizeItems(rawInitialItems);
      const processedInitialItems = processRawItems(sanitizedInitialItems);
      setItems(processedInitialItems);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const addItem = useCallback((itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>) => {
    setItems(prevItems => {
      const newItemRaw: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'> & { id: string } = {
        ...itemData,
        id: String(Date.now() + Math.random()),
      };
      
      const sanitizedNewItem = sanitizeItems([newItemRaw])[0];
      const [processedNewItem] = processRawItems([sanitizedNewItem]);

      const updatedProcessedItems = [...prevItems, processedNewItem];
      
      // Get the raw items from the updated processed list to save to localStorage
      const updatedRawItems = updatedProcessedItems.map(({ finalPrice, searchableText, ...rawItem }) => rawItem);
      
      try {
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updatedRawItems));
      } catch (error) {
        console.warn("Could not save new item to localStorage:", error);
      }
      return updatedProcessedItems;
    });
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== itemId);
        const rawItemsToSave = updatedItems.map(({ finalPrice, searchableText, ...rawItem }) => rawItem);
        try {
            localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(rawItemsToSave));
        } catch (error) {
            console.warn("Could not update items in localStorage after deletion:", error);
        }
        return updatedItems;
    });
  }, []);

  const recordPurchase = useCallback((purchasedItems: CartItem[]) => {
    try {
      const storedCounts = localStorage.getItem(PURCHASE_COUNTS_STORAGE_KEY);
      const counts: Record<string, number> = storedCounts ? JSON.parse(storedCounts) : {};
      
      purchasedItems.forEach(item => {
        counts[item.id] = (counts[item.id] || 0) + item.quantity;
      });

      localStorage.setItem(PURCHASE_COUNTS_STORAGE_KEY, JSON.stringify(counts));
    } catch (error) {
      console.warn("Could not record purchases to localStorage:", error);
    }
  }, []);

  return (
    <ItemContext.Provider value={{ items, addItem, deleteItem, recordPurchase, isLoading }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItemContext = (): ItemContextType => {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useItemContext must be used within an ItemProvider');
  }
  return context;
};
