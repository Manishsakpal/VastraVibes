
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
  isSyncing: boolean;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    try {
      const storedItemsRaw = localStorage.getItem(ITEMS_STORAGE_KEY);
      
      if (storedItemsRaw) {
        const storedItemsParsed = JSON.parse(storedItemsRaw);
        
        if (Array.isArray(storedItemsParsed)) {
          // If mock data has more items than local storage, it's been updated.
          // Force a refresh from mock data to get the latest items.
          if (initialItems.length > storedItemsParsed.length) {
              const sanitized = sanitizeItems(initialItems);
              setItems(sanitized);
              localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(sanitized));
          } else {
            setItems(sanitizeItems(storedItemsParsed));
          }
        } else {
            // Data in storage is invalid, load from mock
             const sanitized = sanitizeItems(initialItems);
             setItems(sanitized);
             localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(sanitized));
        }
      } else {
        // If nothing is in local storage, populate it with the mock data.
        const sanitized = sanitizeItems(initialItems);
        setItems(sanitized);
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(sanitized));
      }
    } catch (error) {
      console.warn("Could not sync items from localStorage, using initial data:", error);
      // Fallback to initial data if any error occurs
      setItems(initialItems);
    } finally {
      setIsSyncing(false);
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
