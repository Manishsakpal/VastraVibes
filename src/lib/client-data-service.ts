
"use client";

import {
  BAG_STORAGE_KEY,
  AUTH_TOKEN_KEY,
  SUPERADMIN_AUTH_TOKEN_KEY,
  CURRENT_ADMIN_ID_KEY,
  RECENT_ORDER_ID_KEY,
} from './constants';
import type { CartItem } from '@/types';


// Helper for safe localStorage access, intended for use in client components/contexts
const safeLocalStorage = {
    getItem: (key: string): string | null => {
        if (typeof window === 'undefined') return null;
        try { return window.localStorage.getItem(key); }
        catch (e) { console.warn(`LocalStorage read error:`, e); return null; }
    },
    setItem: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try { window.localStorage.setItem(key, value); }
        catch (e) { console.warn(`LocalStorage write error:`, e); }
    },
    removeItem: (key: string): void => {
        if (typeof window === 'undefined') return;
        try { window.localStorage.removeItem(key); }
        catch (e) { console.warn(`LocalStorage remove error:`, e); }
    },
};

const getStoredData = <T>(key: string, fallback: T): T => {
    const storedData = safeLocalStorage.getItem(key);
    if (storedData) {
        try { return JSON.parse(storedData) as T; }
        catch (e) { return fallback; }
    }
    return fallback;
};

// --- Bag Service (Client-Side) ---
export const getBagFromStorage = (): CartItem[] => getStoredData(BAG_STORAGE_KEY, []);
export const saveBagToStorage = (items: CartItem[]): void => safeLocalStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(items));
export const clearBagInStorage = (): void => safeLocalStorage.removeItem(BAG_STORAGE_KEY);

// --- Auth Status Service (Client-Side) ---
export const getAuthStatusFromStorage = (): { isAdmin: boolean; isSuperAdmin: boolean; adminId: string | null } => {
    const regularAuth = safeLocalStorage.getItem(AUTH_TOKEN_KEY);
    const superAuth = safeLocalStorage.getItem(SUPERADMIN_AUTH_TOKEN_KEY);
    const storedAdminId = safeLocalStorage.getItem(CURRENT_ADMIN_ID_KEY);
    if (superAuth === 'true') return { isAdmin: false, isSuperAdmin: true, adminId: storedAdminId };
    if (regularAuth === 'true' && storedAdminId) return { isAdmin: true, isSuperAdmin: false, adminId: storedAdminId };
    return { isAdmin: false, isSuperAdmin: false, adminId: null };
}

export const saveAuthStatusToStorage = (status: { isAdmin?: boolean; isSuperAdmin?: boolean; adminId: string | null }): void => {
    if (status.isSuperAdmin) {
        safeLocalStorage.setItem(SUPERADMIN_AUTH_TOKEN_KEY, 'true');
        safeLocalStorage.removeItem(AUTH_TOKEN_KEY);
    } else if (status.isAdmin) {
        safeLocalStorage.setItem(AUTH_TOKEN_KEY, 'true');
        safeLocalStorage.removeItem(SUPERADMIN_AUTH_TOKEN_KEY);
    }
    if (status.adminId) safeLocalStorage.setItem(CURRENT_ADMIN_ID_KEY, status.adminId);
};

export const clearAuthStatusInStorage = (): void => {
    safeLocalStorage.removeItem(AUTH_TOKEN_KEY);
    safeLocalStorage.removeItem(SUPERADMIN_AUTH_TOKEN_KEY);
    safeLocalStorage.removeItem(CURRENT_ADMIN_ID_KEY);
}

// --- Recent Order Service (Client-Side) ---
export const getRecentOrderIdFromStorage = (): string | null => safeLocalStorage.getItem(RECENT_ORDER_ID_KEY);
export const saveRecentOrderIdToStorage = (id: string): void => safeLocalStorage.setItem(RECENT_ORDER_ID_KEY, id);

// --- Visitor Session Service (Client-Side) ---
export const getLastVisitFromStorage = (): number | null => {
    const lastVisitStr = safeLocalStorage.getItem("vastraVibesLastVisit");
    return lastVisitStr ? parseInt(lastVisitStr, 10) : null;
};
export const saveLastVisitToStorage = (time: number): void => {
    safeLocalStorage.setItem("vastraVibesLastVisit", String(time));
};
