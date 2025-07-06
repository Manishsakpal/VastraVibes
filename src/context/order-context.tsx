
"use client";

import type { Order, CartItem, CheckoutDetails, OrderItem, OrderStatus } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useItemContext } from './item-context';
import { 
    getOrdersFromDb, 
    addOrderToDb,
    updateOrderItemStatusInDb,
    getRecentOrderIdFromStorage,
    saveRecentOrderIdToStorage
} from '@/lib/data-service';

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number) => Promise<string>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderStatus) => Promise<void>;
  getRecentOrderId: () => string | null;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { items: masterItems, isLoading: isItemsLoading } = useItemContext();

  useEffect(() => {
    if (isItemsLoading) return; // Wait for master items to load first

    const loadOrders = async () => {
        setIsLoading(true);
        const storedOrders = await getOrdersFromDb();
        setOrders(storedOrders);
        setIsLoading(false);
    }
    loadOrders();
  }, [isItemsLoading]);

  const addOrder = useCallback(async (items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number): Promise<string> => {
    const masterItemMap = new Map(masterItems.map(item => [item.id, item]));

    const orderItems: OrderItem[] = items.map(item => ({
      ...item,
      adminId: masterItemMap.get(item.id)?.adminId,
      status: 'Placed',
    }));
    
    const newOrderData: Omit<Order, 'id'> = {
      date: new Date().toISOString(),
      items: orderItems,
      customerDetails,
      totalAmount,
    };
    
    const newOrder = await addOrderToDb(newOrderData);

    if (newOrder) {
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      saveRecentOrderIdToStorage(newOrder.id);
      return newOrder.id;
    }
    return ''; // Should handle error case
  }, [masterItems, orders]);

  const updateOrderItemStatus = useCallback(async (orderId: string, itemId: string, newStatus: OrderStatus) => {
    const success = await updateOrderItemStatusInDb(orderId, itemId, newStatus);
    if (success) {
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => 
            item.id === itemId ? { ...item, status: newStatus } : item
          );
          return { ...order, items: updatedItems };
        }
        return order;
      }));
    }
  }, [orders]);

  const getRecentOrderId = (): string | null => {
    return getRecentOrderIdFromStorage();
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderItemStatus, getRecentOrderId, isLoading }}>
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
