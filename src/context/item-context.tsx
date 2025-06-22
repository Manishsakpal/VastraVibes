
"use client";

import type { ClothingItem, CartItem } from '@/types';
import { initialItems } from '@/lib/mock-data';
import { ITEMS_STORAGE_KEY, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sanitizeItems } from '@/lib/utils';

interface ItemContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id'>) => void;
  recordPurchase: (purchasedItems: CartItem[]) => void;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with static data for instant load.
  const [items, setItems] = useState<ClothingItem[]>(initialItems);

  // Asynchronously hydrate with data from localStorage after initial render.
  useEffect(() => {
    try {
      const storedItemsRaw = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (storedItemsRaw) {
        const storedItemsParsed = JSON.parse(storedItemsRaw);
        
        // If localStorage has more or equal items, it's considered the source of truth.
        if (Array.isArray(storedItemsParsed) && storedItemsParsed.length >= initialItems.length) {
          const sanitized = sanitizeItems(storedItemsParsed);
          setItems(sanitized);
        } else {
          // If mock data is newer/larger, update localStorage.
          localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(initialItems));
        }
      } else {
        // If nothing in storage, populate it with initial data.
         localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(initialItems));
      }
    } catch (error) {
      console.warn("Could not sync items from localStorage, using initial data:", error);
      // Ensure state is at least the initial items.
      setItems(initialItems);
    }
  }, []);

  const addItem = useCallback((itemData: Omit<ClothingItem, 'id'>) => {
    setItems(prevItems => {
      const newItem: ClothingItem = {
        ...itemData,
        id: String(Date.now() + Math.random()),
        colors: itemData.colors || '',
      };
      const updatedItems = [...prevItems, newItem];
      try {
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (error) {
        console.warn("Could not save new item to localStorage:", error);
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
