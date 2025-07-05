"use client";

import type { Order, CartItem, CheckoutDetails } from '@/types';
import { ORDERS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number) => void;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders: Order[] = JSON.parse(storedOrders);
        if(Array.isArray(parsedOrders)) {
            setOrders(parsedOrders);
        }
      }
    } catch (error) {
      console.warn("Could not access localStorage for orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLocalStorage = (updatedOrders: Order[]) => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    } catch (error) {
      console.warn("Could not save orders to localStorage:", error);
    }
  };

  const addOrder = useCallback((items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      date: new Date().toISOString(),
      items,
      customerDetails,
      totalAmount,
    };
    
    setOrders(prevOrders => {
      const updatedOrders = [newOrder, ...prevOrders];
      updateLocalStorage(updatedOrders);
      return updatedOrders;
    });
  }, []);

  return (
    <OrderContext.Provider value={{ orders, addOrder, isLoading }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};
