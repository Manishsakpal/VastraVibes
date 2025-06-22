"use client";

import type { ClothingItem, CartItem } from '@/types';
import { initialItems } from '@/lib/mock-data.ts';
import { ITEMS_STORAGE_KEY, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ItemContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id'>) => void;
  recordPurchase: (purchasedItems: CartItem[]) => void;
  isLoading: boolean;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let loadedItems: ClothingItem[] = [];
    try {
      const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      let parsedItems: ClothingItem[] = [];
      if (storedItems) {
        parsedItems = JSON.parse(storedItems);
      }

      // If mock data is newer/larger, or if there's no stored data, use mock data.
      // This ensures that updates to the mock data file are reflected on next load.
      if (initialItems.length > parsedItems.length) {
        loadedItems = initialItems;
      } else {
        loadedItems = parsedItems;
      }

    } catch (error) {
      console.warn("Could not access or parse localStorage for items, using initial data:", error);
      loadedItems = initialItems;
    } finally {
      // A simple validation to ensure loadedItems is an array.
      const finalItems = Array.isArray(loadedItems) ? loadedItems : initialItems;
      setItems(finalItems);
      // Persist the potentially updated data back to localStorage
      try {
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(finalItems));
      } catch (e) {
        console.warn("Could not save items to localStorage", e);
      }
      setIsLoading(false);
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
    <ItemContext.Provider value={{ items, addItem, recordPurchase, isLoading }}>
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
