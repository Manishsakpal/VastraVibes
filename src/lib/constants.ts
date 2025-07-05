import type { AdminUser, Category } from '@/types';

export const CATEGORIES: Category[] = ["Men", "Women", "Kids", "Ethnic", "Western"];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
export const COLORS = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Beige", "Navy"];

// Super Admin Credentials
export const SUPERADMIN_ID = "superadmin";
export const SUPERADMIN_PASSWORD = "superpassword";

// Initial Admin Users
export const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: 'admin1', password: 'password1', name: 'Ravi Kumar' },
  { id: 'admin2', password: 'password2', name: 'Priya Sharma' },
  { id: 'admin3', password: 'password3', name: 'Amit Singh' },
  { id: 'admin4', password: 'password4', name: 'Sunita Patel' },
  { id: 'admin5', password: 'password5', name: 'Deepak Verma' },
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
