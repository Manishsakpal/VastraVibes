
"use client";

import type { ClothingItem, CartItem } from '@/types';
import { initialItems } from '@/lib/mock-data.ts';
import { ITEMS_STORAGE_KEY, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sanitizeItems } from '@/lib/utils';

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
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        loadedItems = sanitizeItems(parsedItems);
      } else {
        // If no stored items, use initial (which are assumed to be clean)
        loadedItems = sanitizeItems(initialItems);
      }
    } catch (error) {
      console.warn("Could not access or parse localStorage for items, using initial data:", error);
      loadedItems = sanitizeItems(initialItems);
    } finally {
      setItems(loadedItems);
      // Persist the potentially sanitized data back to localStorage
      try {
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(loadedItems));
      } catch (e) {
        console.warn("Could not save sanitized items to localStorage", e);
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
      const sanitizedNewItem = sanitizeItems([newItem])[0];
      const updatedItems = [...prevItems, sanitizedNewItem];
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
