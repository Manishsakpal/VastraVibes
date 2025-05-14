"use client";

import type { ClothingItem } from '@/types';
import { initialItems } from '@/lib/mock-data';
import { ITEMS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ItemContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id'>) => void;
  isLoading: boolean;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      } else {
        // If nothing in storage, initialize with mock data and store it
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(initialItems));
        setItems(initialItems);
      }
    } catch (error) {
      console.warn("Could not access localStorage for items:", error);
      // Fallback to initial mock data if localStorage fails
      setItems(initialItems);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = useCallback((itemData: Omit<ClothingItem, 'id'>) => {
    setItems(prevItems => {
      const newItem: ClothingItem = {
        ...itemData,
        id: String(Date.now() + Math.random()), // Simple unique ID
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

  return (
    <ItemContext.Provider value={{ items, addItem, isLoading }}>
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
