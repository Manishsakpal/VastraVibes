
"use client";

import type { Order, CartItem, CheckoutDetails, OrderItem, OrderStatus } from '@/types';
import { ORDERS_STORAGE_KEY } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useItemContext } from './item-context';

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderStatus, trackingId?: string) => void;
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
    if (isItemsLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders: Order[] = JSON.parse(storedOrders);
        if(Array.isArray(parsedOrders)) {
            const masterItemMap = new Map(masterItems.map(item => [item.id, item]));

            const sanitizedOrders = parsedOrders.map(order => ({
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
            // This prevents an infinite loop if we were to depend on 'orders' state.
            if (JSON.stringify(parsedOrders) !== JSON.stringify(sanitizedOrders)) {
                updateLocalStorage(sanitizedOrders);
            }
        }
      }
    } catch (error) {
      console.warn("Could not access localStorage for orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isItemsLoading, masterItems]);

  const addOrder = useCallback((items: CartItem[], customerDetails: CheckoutDetails, totalAmount: number) => {
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
    
    setOrders(prevOrders => {
      const updatedOrders = [newOrder, ...prevOrders];
      updateLocalStorage(updatedOrders);
      return updatedOrders;
    });
  }, [masterItems]);

  const updateOrderItemStatus = useCallback((orderId: string, itemId: string, newStatus: OrderStatus, trackingId?: string) => {
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === itemId) {
              const updatedItem: OrderItem = { ...item, status: newStatus };
              
              if (newStatus === 'Shipped' && trackingId) {
                updatedItem.trackingId = trackingId;
              } else if (newStatus !== 'Shipped' && newStatus !== 'Delivered') {
                // Remove tracking ID if status is no longer shipped/delivered
                delete updatedItem.trackingId;
              }
              return updatedItem;
            }
            return item;
          });
          return { ...order, items: updatedItems };
        }
        return order;
      });
      updateLocalStorage(updatedOrders);
      return updatedOrders;
    });
  }, []);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderItemStatus, isLoading }}>
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
