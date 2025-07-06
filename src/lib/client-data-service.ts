
"use client";

import {
  BAG_STORAGE_KEY,
  AUTH_SESSION_KEY,
  RECENT_ORDER_ID_KEY,
  VISITOR_SESSION_KEY,
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
type AuthSession = { adminId: string; role: 'admin' | 'superadmin' };

export const getAuthSessionFromStorage = (): AuthSession | null => {
    return getStoredData<AuthSession | null>(AUTH_SESSION_KEY, null);
}

export const saveAuthSessionToStorage = (session: AuthSession): void => {
    safeLocalStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const clearAuthSessionInStorage = (): void => {
    safeLocalStorage.removeItem(AUTH_SESSION_KEY);
}

// --- Recent Order Service (Client-Side) ---
export const getRecentOrderIdFromStorage = (): string | null => safeLocalStorage.getItem(RECENT_ORDER_ID_KEY);
export const saveRecentOrderIdToStorage = (id: string): void => safeLocalStorage.setItem(RECENT_ORDER_ID_KEY, id);

// --- Visitor Session Service (Client-Side) ---
export const getLastVisitFromStorage = (): number | null => {
    const lastVisitStr = safeLocalStorage.getItem(VISITOR_SESSION_KEY);
    return lastVisitStr ? parseInt(lastVisitStr, 10) : null;
};
export const saveLastVisitToStorage = (time: number): void => {
    safeLocalStorage.setItem(VISITOR_SESSION_KEY, String(time));
};
