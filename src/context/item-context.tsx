
"use client";

import type { ClothingItem, CartItem } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { processRawItems, sanitizeItems } from '@/lib/utils';
import { useAdminAuth } from './admin-auth-context';
import {
  getItemsFromDb,
  addItemToDb,
  updateItemInDb,
  deleteItemFromDb,
  getPurchaseCountsFromDb,
  updatePurchaseCountsInDb
} from '@/lib/data-service';

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
        try {
          const [rawItems, counts] = await Promise.all([
              getItemsFromDb(),
              getPurchaseCountsFromDb(),
          ]);
          
          const sanitized = sanitizeItems(rawItems);
          const processed = processRawItems(sanitized);
          setItems(processed);
          setPurchaseCounts(counts);
        } catch (error) {
          console.error("Failed to load item data:", error);
          setItems([]);
          setPurchaseCounts({});
        } finally {
          setIsLoading(false);
        }
    };
    loadData();
  }, []);

  const addItem = useCallback(async (itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId'>) => {
    // Sanitize URLs before sending to the database.
    const [sanitizedItemData] = sanitizeItems([itemData as any]);
    
    const itemWithAdmin = {
      ...sanitizedItemData,
      adminId: currentAdminId || undefined,
    };
    
    const addedItemRaw = await addItemToDb(itemWithAdmin);

    if (addedItemRaw) {
        // Data from DB is now clean. We just need to process for calculated fields.
        const [processedNewItem] = processRawItems([addedItemRaw]);
        setItems(prevItems => [...prevItems, processedNewItem]);
    }
  }, [currentAdminId]);

  const updateItem = useCallback(async (itemId: string, itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText' | 'adminId'>) => {
    // Sanitize URLs before sending to the database.
    const [sanitizedItemData] = sanitizeItems([itemData as any]);

    const updatedItemRaw = await updateItemInDb(itemId, sanitizedItemData);

    if (updatedItemRaw) {
      // Data from DB is now clean. We just need to process for calculated fields.
      const [processedItem] = processRawItems([updatedItemRaw]);
      setItems(prevItems => prevItems.map(item => item.id === itemId ? processedItem : item));
    }
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    const success = await deleteItemFromDb(itemId);
    if (success) {
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
  }, []);

  const recordPurchase = useCallback(async (purchasedItems: CartItem[]) => {
    await updatePurchaseCountsInDb(purchasedItems);
    const newCounts = await getPurchaseCountsFromDb();
    setPurchaseCounts(newCounts);
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
