"use client";

import type { ClothingItem, CartItem } from '@/types';
import { initialItems } from '@/lib/mock-data.ts';
import { ITEMS_STORAGE_KEY, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ItemContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id'>) => void;
  recordPurchase: (purchasedItems: CartItem[]) => void;
  isSyncing: boolean;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>(initialItems);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    try {
      const storedItemsRaw = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (storedItemsRaw) {
        const storedItemsParsed = JSON.parse(storedItemsRaw);
        
        if (Array.isArray(storedItemsParsed)) {
          // If local storage is more up-to-date (has more items), use it.
          // This handles the case where the user has added items.
          if (storedItemsParsed.length > initialItems.length) {
            setItems(storedItemsParsed);
          }
        }
      } else {
        // If nothing is in local storage, populate it with the mock data.
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(initialItems));
      }
    } catch (error) {
      console.warn("Could not sync items from localStorage, using initial data:", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const addItem = useCallback((itemData: Omit<ClothingItem, 'id'>) => {
    setItems(prevItems => {
      const newItem: ClothingItem = {
        ...itemData,
        id: String(Date.now() + Math.random()),
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
    <ItemContext.Provider value={{ items, addItem, recordPurchase, isSyncing }}>
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
