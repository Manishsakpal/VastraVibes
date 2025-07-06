
import type { AdminUser, Category } from '@/types';

export const CATEGORIES: Category[] = ["Men", "Women", "Kids", "Ethnic", "Western"];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
export const COLORS = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Beige", "Navy"];

// --- Keys for localStorage (Client-Side State) ---

// Auth state is kept on the client for the current session
export const AUTH_SESSION_KEY = "vastraVibesAuthSession";

// User-specific data is kept on the client
export const BAG_STORAGE_KEY = "vastraVibesBag";
export const ORDER_HISTORY_KEY = "vastraVibesOrderHistory";
export const VISITOR_SESSION_KEY = "vastraVibesLastVisit";
