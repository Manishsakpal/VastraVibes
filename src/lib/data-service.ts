
'use client'; // This service will be used by client components and needs to access localStorage

import {
  ITEMS_STORAGE_KEY,
  ADMIN_USERS_STORAGE_KEY,
  ORDERS_STORAGE_KEY,
  BAG_STORAGE_KEY,
  PURCHASE_COUNTS_STORAGE_KEY,
  AUTH_TOKEN_KEY,
  SUPERADMIN_AUTH_TOKEN_KEY,
  CURRENT_ADMIN_ID_KEY,
  RECENT_ORDER_ID_KEY,
  VISITOR_COUNT_KEY,
  LAST_VISIT_KEY,
} from './constants';
import type { ClothingItem, AdminUser, Order, CartItem } from '@/types';
import { initialItems as rawInitialItems } from './mock-data';

// Helper to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`LocalStorage read error for key "${key}":`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`LocalStorage write error for key "${key}":`, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`LocalStorage remove error for key "${key}":`, e);
    }
  },
};

// --- Generic Service Functions ---
const getStoredData = async <T>(key: string, fallback: T): Promise<T> => {
  const storedData = safeLocalStorage.getItem(key);
  if (storedData) {
    try {
      return JSON.parse(storedData) as T;
    } catch (e) {
      console.warn(`Failed to parse stored data for key "${key}", using fallback.`, e);
      return fallback;
    }
  }
  return fallback;
};

const saveStoredData = async <T>(key: string, data: T): Promise<void> => {
  safeLocalStorage.setItem(key, JSON.stringify(data));
};

// --- Item Service ---
export const getItemsFromStorage = async (): Promise<Omit<ClothingItem, 'finalPrice' | 'searchableText'>[]> => {
    const storedItems = await getStoredData<any[]>(ITEMS_STORAGE_KEY, null);
    if (storedItems === null) {
        // If nothing is in storage, initialize it with the default mock data.
        await saveItemsToStorage(rawInitialItems);
        return rawInitialItems;
    }
    return storedItems;
}
export const saveItemsToStorage = async (items: Omit<ClothingItem, 'finalPrice' | 'searchableText'>[]): Promise<void> => saveStoredData(ITEMS_STORAGE_KEY, items);

// --- Bag Service ---
export const getBagFromStorage = async (): Promise<CartItem[]> => getStoredData(BAG_STORAGE_KEY, []);
export const saveBagToStorage = async (items: CartItem[]): Promise<void> => saveStoredData(BAG_STORAGE_KEY, items);
export const clearBagInStorage = async (): Promise<void> => safeLocalStorage.removeItem(BAG_STORAGE_KEY);

// --- Order Service ---
export const getOrdersFromStorage = async (): Promise<Order[]> => getStoredData(ORDERS_STORAGE_KEY, []);
export const saveOrdersToStorage = async (orders: Order[]): Promise<void> => saveStoredData(ORDERS_STORAGE_KEY, orders);
export const getRecentOrderIdFromStorage = async (): Promise<string | null> => safeLocalStorage.getItem(RECENT_ORDER_ID_KEY);
export const saveRecentOrderIdToStorage = async (id: string): Promise<void> => safeLocalStorage.setItem(RECENT_ORDER_ID_KEY, id);

// --- Purchase Counts Service ---
export const getPurchaseCountsFromStorage = async (): Promise<Record<string, number>> => getStoredData(PURCHASE_COUNTS_STORAGE_KEY, {});
export const savePurchaseCountsToStorage = async (counts: Record<string, number>): Promise<void> => saveStoredData(PURCHASE_COUNTS_STORAGE_KEY, counts);

// --- Admin Service ---
export const getAdminsFromStorage = async (): Promise<AdminUser[]> => getStoredData(ADMIN_USERS_STORAGE_KEY, []);
export const saveAdminsToStorage = async (admins: AdminUser[]): Promise<void> => saveStoredData(ADMIN_USERS_STORAGE_KEY, admins);

export const getAuthStatusFromStorage = async (): Promise<{ isAdmin: boolean; isSuperAdmin: boolean; adminId: string | null }> => {
    const regularAuth = safeLocalStorage.getItem(AUTH_TOKEN_KEY);
    const superAuth = safeLocalStorage.getItem(SUPERADMIN_AUTH_TOKEN_KEY);
    const storedAdminId = safeLocalStorage.getItem(CURRENT_ADMIN_ID_KEY);
    
    if (superAuth === 'true') {
        return { isAdmin: false, isSuperAdmin: true, adminId: storedAdminId };
    }
    if (regularAuth === 'true' && storedAdminId) {
        return { isAdmin: true, isSuperAdmin: false, adminId: storedAdminId };
    }
    return { isAdmin: false, isSuperAdmin: false, adminId: null };
}

export const saveAuthStatusToStorage = async (status: { isAdmin?: boolean; isSuperAdmin?: boolean; adminId: string | null }): Promise<void> => {
    if (status.isSuperAdmin) {
        safeLocalStorage.setItem(SUPERADMIN_AUTH_TOKEN_KEY, 'true');
        safeLocalStorage.removeItem(AUTH_TOKEN_KEY);
    } else if (status.isAdmin) {
        safeLocalStorage.setItem(AUTH_TOKEN_KEY, 'true');
        safeLocalStorage.removeItem(SUPERADMIN_AUTH_TOKEN_KEY);
    }
    
    if (status.adminId) {
        safeLocalStorage.setItem(CURRENT_ADMIN_ID_KEY, status.adminId);
    }
};

export const clearAuthStatusInStorage = async (): Promise<void> => {
    safeLocalStorage.removeItem(AUTH_TOKEN_KEY);
    safeLocalStorage.removeItem(SUPERADMIN_AUTH_TOKEN_KEY);
    safeLocalStorage.removeItem(CURRENT_ADMIN_ID_KEY);
}

// --- Visitor Service ---
export const getVisitorDataFromStorage = async (): Promise<{ count: number; lastVisit: number | null }> => {
    const countStr = safeLocalStorage.getItem(VISITOR_COUNT_KEY) || '0';
    const lastVisitStr = safeLocalStorage.getItem(LAST_VISIT_KEY);
    return { 
        count: parseInt(countStr, 10), 
        lastVisit: lastVisitStr ? parseInt(lastVisitStr, 10) : null 
    };
};

export const saveVisitorDataToStorage = async (data: { count: number; lastVisit: number }): Promise<void> => {
    safeLocalStorage.setItem(VISITOR_COUNT_KEY, String(data.count));
    safeLocalStorage.setItem(LAST_VISIT_KEY, String(data.lastVisit));
};
