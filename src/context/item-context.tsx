
"use client";

import type { ClothingItem, CartItem } from '@/types';
import { initialItems } from '@/lib/mock-data.ts';
import { ITEMS_STORAGE_KEY, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const ALLOWED_IMAGE_HOSTNAMES = [
  'placehold.co',
  'images.unsplash.com',
  'plus.unsplash.com',
];
const DEFAULT_PLACEHOLDER = 'https://placehold.co/600x800.png';

const sanitizeItems = (items: ClothingItem[]): ClothingItem[] => {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls : [];
    const sanitizedUrls = imageUrls.map(url => {
      if (typeof url !== 'string') return DEFAULT_PLACEHOLDER;
      try {
        const hostname = new URL(url).hostname;
        if (ALLOWED_IMAGE_HOSTNAMES.some(allowedHost => hostname === allowedHost || hostname.endsWith('.' + allowedHost))) {
          return url;
        }
      } catch (e) {
        // Invalid URL format, fall through to return placeholder
      }
      return DEFAULT_PLACEHOLDER;
    });

    // If after sanitizing, there are no images, add a placeholder
    if (sanitizedUrls.length === 0) {
        sanitizedUrls.push(DEFAULT_PLACEHOLDER);
    }

    return {
      ...item,
      imageUrls: sanitizedUrls,
    };
  });
};


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
        loadedItems = initialItems;
      }
    } catch (error) {
      console.warn("Could not access or parse localStorage for items, using initial data:", error);
      loadedItems = initialItems;
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
