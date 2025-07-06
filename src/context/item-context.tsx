
"use client";

import type { ClothingItem, CartItem } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sanitizeItems } from '@/lib/utils';
import { useAdminAuth } from './admin-auth-context';
import {
  getItemsFromStorage,
  saveItemsToStorage,
  getPurchaseCountsFromStorage,
  savePurchaseCountsToStorage,
} from '@/lib/data-service';

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

// Helper to strip processed fields before saving back to storage
const getRawItemsFromState = (processedItems: ClothingItem[]): Omit<ClothingItem, 'finalPrice' | 'searchableText'>[] => {
  return processedItems.map(({ finalPrice, searchableText, ...rawItem }) => rawItem);
}

interface ItemContextType {
  items: ClothingItem[];
  addItem: (item: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId'>) => Promise<void>;
  updateItem: (itemId: string, itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId'>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  recordPurchase: (purchasedItems: CartItem[]) => Promise<void>;
  purchaseCounts: Record<string, number>;
  isLoading: boolean;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [purchaseCounts, setPurchaseCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { currentAdminId } = useAdminAuth();

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const [rawItems, counts] = await Promise.all([
            getItemsFromStorage(),
            getPurchaseCountsFromStorage(),
        ]);
        
        const sanitized = sanitizeItems(rawItems);
        const processed = processRawItems(sanitized);
        setItems(processed);
        setPurchaseCounts(counts);
        
        setIsLoading(false);
    };
    loadData();
  }, []);

  const addItem = useCallback(async (itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId'>) => {
    const newItemRaw: Omit<ClothingItem, 'finalPrice' | 'searchableText'> = {
      ...itemData,
      id: String(Date.now() + Math.random()),
      adminId: currentAdminId || undefined,
    };
    
    const sanitizedNewItem = sanitizeItems([newItemRaw])[0];
    const [processedNewItem] = processRawItems([sanitizedNewItem]);
    
    setItems(prevItems => {
        const updatedProcessedItems = [...prevItems, processedNewItem];
        const updatedRawItems = getRawItemsFromState(updatedProcessedItems);
        saveItemsToStorage(updatedRawItems); // Fire and forget saving
        return updatedProcessedItems;
    });
  }, [currentAdminId]);

  const updateItem = useCallback(async (itemId: string, itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId'>) => {
    setItems(prevItems => {
        const updatedItems = prevItems.map(item => {
            if (item.id === itemId) {
                const rawToProcess: Omit<ClothingItem, 'finalPrice' | 'searchableText'> = { ...itemData, id: itemId, adminId: item.adminId };
                const sanitizedItem = sanitizeItems([rawToProcess])[0];
                const [processedItem] = processRawItems([sanitizedItem]);
                return processedItem;
            }
            return item;
        });
        const rawItemsToSave = getRawItemsFromState(updatedItems);
        saveItemsToStorage(rawItemsToSave); // Fire and forget
        return updatedItems;
    });
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    setItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== itemId);
        const rawItemsToSave = getRawItemsFromState(updatedItems);
        saveItemsToStorage(rawItemsToSave); // Fire and forget
        return updatedItems;
    });
  }, []);

  const recordPurchase = useCallback(async (purchasedItems: CartItem[]) => {
    const counts = await getPurchaseCountsFromStorage();
    
    purchasedItems.forEach(item => {
      counts[item.id] = (counts[item.id] || 0) + item.quantity;
    });

    setPurchaseCounts(counts);
    await savePurchaseCountsToStorage(counts);
  }, []);

  return (
    <ItemContext.Provider value={{ items, addItem, updateItem, deleteItem, recordPurchase, purchaseCounts, isLoading }}>
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
