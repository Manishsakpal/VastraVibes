
"use client";

import type { ClothingItem, CartItem, AdminUser } from '@/types';
import { initialItems as rawInitialItems } from '@/lib/mock-data';
import { ITEMS_STORAGE_KEY, PURCHASE_COUNTS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sanitizeItems } from '@/lib/utils';
import { useAdminAuth } from './admin-auth-context';

// Helper function to add performance-optimized fields, including the admin's name
const processRawItems = (items: Omit<ClothingItem, 'finalPrice' | 'searchableText' | 'adminName'>[], admins: AdminUser[]): ClothingItem[] => {
  return items.map(item => {
    const finalPrice = (item.discount && item.discount > 0)
      ? item.price * (1 - item.discount / 100)
      : item.price;
    
    const admin = admins.find(a => a.id === item.adminId);
    const adminName = admin ? admin.name : 'Vastra Vibes';

    const searchableText = [
      item.title,
      item.description,
      item.colors,
      item.size,
      adminName,
    ].join(' ').toLowerCase();

    // The type assertion is safe because we are adding the missing properties.
    return { ...item, finalPrice, searchableText, adminName } as ClothingItem;
  });
};

interface ItemContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId' | 'adminName'>) => void;
  updateItem: (itemId: string, itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId' | 'adminName'>) => void;
  deleteItem: (itemId: string) => void;
  recordPurchase: (purchasedItems: CartItem[]) => void;
  isLoading: boolean;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentAdminId, admins, isLoading: isAdminLoading } = useAdminAuth();

  useEffect(() => {
    // Wait for the admin list to be loaded before processing items
    if (isAdminLoading) {
      setIsLoading(true);
      return;
    }
    
    try {
      const storedItemsRaw = localStorage.getItem(ITEMS_STORAGE_KEY);
      let storedItemsParsed: any[] | null = null;

      if (storedItemsRaw) {
        try { storedItemsParsed = JSON.parse(storedItemsRaw); } catch { storedItemsParsed = null; }
      }

      const isDataInvalid = !storedItemsParsed || !Array.isArray(storedItemsParsed) || storedItemsParsed.length === 0 || !storedItemsParsed[0].hasOwnProperty('adminId');

      let itemsToProcess: any[];
      if (storedItemsRaw && !isDataInvalid) {
        itemsToProcess = storedItemsParsed;
      } else {
        if (storedItemsRaw) { console.log("Re-initializing item data from mock-data.ts due to invalid or old storage format."); }
        itemsToProcess = rawInitialItems;
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(itemsToProcess));
      }
      
      const sanitized = sanitizeItems(itemsToProcess);
      const processed = processRawItems(sanitized, admins);
      setItems(processed);

    } catch (error) {
      console.warn("Could not read from localStorage, falling back to initial data:", error);
      const sanitized = sanitizeItems(rawInitialItems);
      const processed = processRawItems(sanitized, admins);
      setItems(processed);
    } finally {
        setIsLoading(false);
    }
  }, [admins, isAdminLoading]);

  // Helper to strip processed fields before saving back to storage
  const getRawItemsFromState = (processedItems: ClothingItem[]) => {
    return processedItems.map(({ finalPrice, searchableText, adminName, ...rawItem }) => rawItem);
  }

  const addItem = useCallback((itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId' | 'adminName'>) => {
    setItems(prevItems => {
      const newItemRaw: Omit<ClothingItem, 'finalPrice' | 'searchableText' | 'adminName'> = {
        ...itemData,
        id: String(Date.now() + Math.random()),
        adminId: currentAdminId || undefined,
      };
      
      const sanitizedNewItem = sanitizeItems([newItemRaw])[0];
      const [processedNewItem] = processRawItems([sanitizedNewItem], admins);
      const updatedProcessedItems = [...prevItems, processedNewItem];
      const updatedRawItems = getRawItemsFromState(updatedProcessedItems);
      
      try {
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updatedRawItems));
      } catch (error) {
        console.warn("Could not save new item to localStorage:", error);
      }
      return updatedProcessedItems;
    });
  }, [currentAdminId, admins]);

  const updateItem = useCallback((itemId: string, itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId' | 'adminName'>) => {
    setItems(prevItems => {
        const updatedItems = prevItems.map(item => {
            if (item.id === itemId) {
                const rawToProcess: Omit<ClothingItem, 'finalPrice' | 'searchableText' | 'adminName'> = { ...itemData, id: itemId, adminId: item.adminId };
                const sanitizedItem = sanitizeItems([rawToProcess])[0];
                const [processedItem] = processRawItems([sanitizedItem], admins);
                return processedItem;
            }
            return item;
        });

        const rawItemsToSave = getRawItemsFromState(updatedItems);
        try {
            localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(rawItemsToSave));
        } catch (error) {
            console.warn("Could not update items in localStorage:", error);
        }
        return updatedItems;
    });
  }, [admins]);

  const deleteItem = useCallback((itemId: string) => {
    setItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== itemId);
        const rawItemsToSave = getRawItemsFromState(updatedItems);
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
    <ItemContext.Provider value={{ items, addItem, updateItem, deleteItem, recordPurchase, isLoading }}>
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
