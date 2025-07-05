
"use client";

import type { Order, CartItem, CheckoutDetails } from '@/types';
import { ORDERS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useItemContext } from './item-context';

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number) => void;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { items: masterItems, isLoading: isItemsLoading } = useItemContext();

  const updateLocalStorage = (updatedOrders: Order[]) => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    } catch (error) {
      console.warn("Could not save orders to localStorage:", error);
    }
  };

  useEffect(() => {
    // We must wait for the master item list to be loaded before we can sanitize orders.
    if (isItemsLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders: Order[] = JSON.parse(storedOrders);
        if(Array.isArray(parsedOrders)) {
            // Create a Map for efficient lookup of master items.
            const masterItemMap = new Map(masterItems.map(item => [item.id, item]));

            // This is the data sanitization step. It ensures that older orders
            // stored in localStorage without a `finalPrice` or `adminId` get them added.
            const sanitizedOrders = parsedOrders.map(order => ({
                ...order,
                items: order.items.map(itemInOrder => {
                    const masterItem = masterItemMap.get(itemInOrder.id);
                    let finalPrice = itemInOrder.finalPrice;
                    let adminId = itemInOrder.adminId;

                    // Fix #1: If finalPrice is missing, calculate it.
                    if (finalPrice === undefined && typeof itemInOrder.price === 'number') {
                        finalPrice = (typeof itemInOrder.discount === 'number' && itemInOrder.discount > 0)
                            ? itemInOrder.price * (1 - itemInOrder.discount / 100)
                            : itemInOrder.price;
                    }
                    
                    // Fix #2: If adminId is missing, look it up from the master list.
                    if (adminId === undefined && masterItem) {
                        adminId = masterItem.adminId;
                    }

                    return { ...itemInOrder, finalPrice, adminId };
                })
            }));

            setOrders(sanitizedOrders);
            // Re-save the sanitized orders back to localStorage to prevent this check on every load.
            updateLocalStorage(sanitizedOrders);
        }
      }
    } catch (error) {
      console.warn("Could not access localStorage for orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isItemsLoading, masterItems]);

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
