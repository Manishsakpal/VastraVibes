
"use client";

import type { Order, CartItem, CheckoutDetails, OrderItem, OrderStatus } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useItemContext } from './item-context';
import { 
    getOrdersFromStorage, 
    saveOrdersToStorage,
    getRecentOrderIdFromStorage,
    saveRecentOrderIdToStorage
} from '@/lib/data-service';

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number) => Promise<string>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderStatus) => Promise<void>;
  getRecentOrderId: () => Promise<string | null>;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { items: masterItems, isLoading: isItemsLoading } = useItemContext();

  useEffect(() => {
    if (isItemsLoading) {
      return;
    }

    const loadOrders = async () => {
        setIsLoading(true);
        const storedOrders = await getOrdersFromStorage();

        if (storedOrders.length > 0) {
            const masterItemMap = new Map(masterItems.map(item => [item.id, item]));

            const sanitizedOrders = storedOrders.map(order => ({
                ...order,
                items: order.items.map(itemInOrder => {
                    const masterItem = masterItemMap.get(itemInOrder.id);
                    let { finalPrice, adminId, status } = itemInOrder;

                    if (finalPrice === undefined && typeof itemInOrder.price === 'number') {
                        finalPrice = (typeof itemInOrder.discount === 'number' && itemInOrder.discount > 0)
                            ? itemInOrder.price * (1 - itemInOrder.discount / 100)
                            : itemInOrder.price;
                    }
                    
                    if (adminId === undefined && masterItem) {
                        adminId = masterItem.adminId;
                    }
                    
                    if (status === undefined) {
                      status = 'Placed';
                    }

                    return { ...itemInOrder, finalPrice, adminId, status };
                })
            }));

            setOrders(sanitizedOrders);
            // No need to write back immediately unless there were actual changes.
            if (JSON.stringify(storedOrders) !== JSON.stringify(sanitizedOrders)) {
                await saveOrdersToStorage(sanitizedOrders);
            }
        }
        setIsLoading(false);
    }
    loadOrders();
  }, [isItemsLoading, masterItems]);

  const addOrder = useCallback(async (items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number): Promise<string> => {
    const masterItemMap = new Map(masterItems.map(item => [item.id, item]));

    const orderItems: OrderItem[] = items.map(item => ({
      ...item,
      adminId: masterItemMap.get(item.id)?.adminId, // Ensure adminId is attached from master list
      status: 'Placed',
    }));
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      date: new Date().toISOString(),
      items: orderItems,
      customerDetails,
      totalAmount,
    };
    
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    await saveOrdersToStorage(updatedOrders);
    await saveRecentOrderIdToStorage(newOrder.id);

    return newOrder.id;
  }, [masterItems, orders]);

  const updateOrderItemStatus = useCallback(async (orderId: string, itemId: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => {
          if (item.id === itemId) {
            const updatedItem: OrderItem = { ...item, status: newStatus };
            return updatedItem;
          }
          return item;
        });
        return { ...order, items: updatedItems };
      }
      return order;
    });
    setOrders(updatedOrders);
    await saveOrdersToStorage(updatedOrders);
  }, [orders]);

  const getRecentOrderId = useCallback(async (): Promise<string | null> => {
    return getRecentOrderIdFromStorage();
  }, []);

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
