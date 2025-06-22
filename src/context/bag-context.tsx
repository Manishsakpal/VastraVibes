"use client";

import type { ClothingItem, CartItem } from '@/types';
import { BAG_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { sanitizeItems } from '@/lib/utils';

interface BagContextType {
  cartItems: CartItem[];
  addToBag: (item: ClothingItem) => void;
  removeFromBag: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearBag: () => void;
  cartCount: number;
  totalPrice: number;
  isLoading: boolean;
}

const BagContext = createContext<BagContextType | undefined>(undefined);

export const BagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedBag = localStorage.getItem(BAG_STORAGE_KEY);
      if (storedBag) {
        const parsedItems = JSON.parse(storedBag);
        setCartItems(sanitizeItems(parsedItems));
      }
    } catch (error) {
      console.warn("Could not access localStorage for bag:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLocalStorage = (items: CartItem[]) => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Could not save bag to localStorage:", error);
    }
  };

  const addToBag = useCallback((item: ClothingItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      let updatedItems;
      if (existingItem) {
        updatedItems = prevItems.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        updatedItems = [...prevItems, { ...item, quantity: 1 }];
      }
      updateLocalStorage(updatedItems);
      return updatedItems;
    });
  }, []);

  const removeFromBag = useCallback((itemId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      updateLocalStorage(updatedItems);
      return updatedItems;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBag(itemId);
      return;
    }
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      updateLocalStorage(updatedItems);
      return updatedItems;
    });
  }, [removeFromBag]);

  const clearBag = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem(BAG_STORAGE_KEY);
    } catch (error) {
      console.warn("Could not clear bag from localStorage:", error);
    }
  }, []);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const finalPrice = (item.discount && item.discount > 0)
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + finalPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  return (
    <BagContext.Provider value={{ cartItems, addToBag, removeFromBag, updateQuantity, clearBag, cartCount, totalPrice, isLoading }}>
      {children}
    </BagContext.Provider>
  );
};

export const useBagContext = (): BagContextType => {
  const context = useContext(BagContext);
  if (context === undefined) {
    throw new Error('useBagContext must be used within a BagProvider');
  }
  return context;
};
