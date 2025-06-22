
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
      item.category,
      item.size,
      item.colors,
      ...(item.specifications || [])
    ].join(' ').toLowerCase();

    // The type assertion is safe because we are adding the missing properties.
    return { ...item, finalPrice, searchableText } as ClothingItem;
  });
};

interface ItemContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>) => void;
  recordPurchase: (purchasedItems: CartItem[]) => void;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>(() => processRawItems(sanitizeItems(rawInitialItems)));

  useEffect(() => {
    try {
      // The initial state is set from mock data. This effect merges any user-added items from localStorage.
      const initialProcessedItems = processRawItems(sanitizeItems(rawInitialItems));
      const initialItemIds = new Set(initialProcessedItems.map(item => item.id));

      const storedItemsRaw = localStorage.getItem(ITEMS_STORAGE_KEY);
      let finalItems = [...initialProcessedItems];

      if (storedItemsRaw) {
        const storedItemsParsed = JSON.parse(storedItemsRaw);
        
        if (Array.isArray(storedItemsParsed)) {
          const sanitizedStoredItems = sanitizeItems(storedItemsParsed);
          const processedStoredItems = processRawItems(sanitizedStoredItems);
          
          const userAddedItems = processedStoredItems.filter(
            storedItem => !initialItemIds.has(storedItem.id)
          );

          if (userAddedItems.length > 0) {
            finalItems = [...initialProcessedItems, ...userAddedItems];
          }
        }
      }
      
      // Update state and localStorage with the clean, merged list.
      setItems(finalItems);
      
      // We also update localStorage to be in sync, removing any old mock data from it.
      const rawFinalItems = finalItems.map(({ finalPrice, searchableText, ...rawItem }) => rawItem);
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(rawFinalItems));

    } catch (error) {
      console.warn("Could not sync items from localStorage, using initial data:", error);
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
      
      const rawPrevItems = prevItems.map(({ finalPrice, searchableText, ...rawItem }) => rawItem);
      const updatedRawItems = [...rawPrevItems, sanitizedNewItem];
      
      try {
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updatedRawItems));
      } catch (error) {
        console.warn("Could not save new item to localStorage:", error);
      }
      return updatedProcessedItems;
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
    <ItemContext.Provider value={{ items, addItem, recordPurchase }}>
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
