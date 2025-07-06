
import type { AdminUser, Category } from '@/types';

export const CATEGORIES: Category[] = ["Men", "Women", "Kids", "Ethnic", "Western"];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
export const COLORS = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Beige", "Navy"];

// Super Admin Credentials (not stored in DB)
export const SUPERADMIN_ID = "superAdmin";
export const SUPERADMIN_PASSWORD = "superPassword";

// --- Keys for localStorage (Client-Side State) ---

// Auth state is kept on the client for the current session
export const AUTH_TOKEN_KEY = "vastraVibesAdminAuth";
export const SUPERADMIN_AUTH_TOKEN_KEY = "vastraVibesSuperAdminAuth";
export const CURRENT_ADMIN_ID_KEY = "vastraVibesCurrentAdminId";

// User-specific data is kept on the client
export const BAG_STORAGE_KEY = "vastraVibesBag";
export const RECENT_ORDER_ID_KEY = "vastraVibesRecentOrderId";

// Deprecated keys for old localStorage approach are no longer used.
// ITEMS_STORAGE_KEY, ADMIN_USERS_STORAGE_KEY, etc. are removed.
