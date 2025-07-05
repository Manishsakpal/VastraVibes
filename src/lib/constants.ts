
import type { AdminUser, Category } from '@/types';

export const CATEGORIES: Category[] = ["Men", "Women", "Kids", "Ethnic", "Western"];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
export const COLORS = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Beige", "Navy"];

// Super Admin Credentials
export const SUPERADMIN_ID = "superAdmin";
export const SUPERADMIN_PASSWORD = "superPassword";

// Initial Admin Users
export const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: 'admin1', password: 'password1' },
  { id: 'admin2', password: 'password2' },
  { id: 'admin3', password: 'password3' },
  { id: 'admin4', password: 'password4' },
  { id: 'admin5', password: 'password5' },
];


// Local Storage Keys
export const AUTH_TOKEN_KEY = "vastraVibesAdminAuth";
export const SUPERADMIN_AUTH_TOKEN_KEY = "vastraVibesSuperAdminAuth";
export const ADMIN_USERS_STORAGE_KEY = "vastraVibesAdminUsers";
export const CURRENT_ADMIN_ID_KEY = "vastraVibesCurrentAdminId";

export const ITEMS_STORAGE_KEY = "vastraVibesItems";
export const BAG_STORAGE_KEY = "vastraVibesBag";
export const PURCHASE_COUNTS_STORAGE_KEY = "vastraVibesPurchaseCounts";
export const ORDERS_STORAGE_KEY = "vastraVibesOrders";
export const RECENT_ORDER_ID_KEY = "vastraVibesRecentOrderId";

// Visitor tracking keys
export const VISITOR_COUNT_KEY = "vastraVibesVisitorCount";
export const LAST_VISIT_KEY = "vastraVibesLastVisit";
