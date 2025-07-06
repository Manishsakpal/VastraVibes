
'use server';

import {
  BAG_STORAGE_KEY,
  AUTH_TOKEN_KEY,
  SUPERADMIN_AUTH_TOKEN_KEY,
  CURRENT_ADMIN_ID_KEY,
  RECENT_ORDER_ID_KEY,
} from './constants';
import type { ClothingItem, ClothingItemDb, AdminUser, AdminUserDb, Order, OrderDb, CartItem } from '@/types';
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

// ================================================================= //
//                      DATABASE HELPER FUNCTIONS                      //
// ================================================================= //

const dbName = process.env.DB_NAME;
if (!dbName) {
  throw new Error('Please define the DB_NAME environment variable inside .env.local');
}

const getDb = async () => {
  const client = await clientPromise;
  return client.db(dbName);
}

// Map MongoDB's _id to a string id for frontend use
const mapFromDb = <T extends { _id?: ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } => {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id!.toHexString() };
};

// ================================================================= //
//                        ITEM DATA SERVICE (DB)                       //
// ================================================================= //

export const getItemsFromDb = async (): Promise<ClothingItem[]> => {
  try {
    const db = await getDb();
    const items = await db.collection('items').find({}).toArray();
    return items.map(item => mapFromDb(item as ClothingItemDb) as ClothingItem);
  } catch (e) {
    console.error('Database error fetching items:', e);
    return [];
  }
}

export const addItemToDb = async (itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>): Promise<ClothingItem | null> => {
    try {
        const db = await getDb();
        const result = await db.collection('items').insertOne(itemData);
        if (result.insertedId) {
            const insertedDoc = await db.collection('items').findOne({ _id: result.insertedId });
            return mapFromDb(insertedDoc as ClothingItemDb) as ClothingItem;
        }
        return null;
    } catch (e) {
        console.error('Database error adding item:', e);
        return null;
    }
};

export const updateItemInDb = async (itemId: string, itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>): Promise<ClothingItem | null> => {
    try {
        const db = await getDb();
        const result = await db.collection('items').findOneAndUpdate(
            { _id: new ObjectId(itemId) },
            { $set: itemData },
            { returnDocument: 'after' }
        );
        return result ? mapFromDb(result as ClothingItemDb) as ClothingItem : null;
    } catch (e) {
        console.error('Database error updating item:', e);
        return null;
    }
};

export const deleteItemFromDb = async (itemId: string): Promise<boolean> => {
    try {
        const db = await getDb();
        const result = await db.collection('items').deleteOne({ _id: new ObjectId(itemId) });
        return result.deletedCount === 1;
    } catch (e) {
        console.error('Database error deleting item:', e);
        return false;
    }
};


// ================================================================= //
//                        ADMIN DATA SERVICE (DB)                      //
// ================================================================= //

export const getAdminsFromDb = async (): Promise<AdminUser[]> => {
    try {
        const db = await getDb();
        const admins = await db.collection('admins').find({}).project({ password: 0 }).toArray();
        return admins.map(admin => ({ id: admin.id }));
    } catch (e) {
        console.error('Database error fetching admins:', e);
        return [];
    }
};

export const findAdminById = async (id: string): Promise<AdminUserDb | null> => {
    try {
        const db = await getDb();
        return await db.collection('admins').findOne<AdminUserDb>({ id: id });
    } catch (e) {
        console.error('Database error finding admin:', e);
        return null;
    }
};

export const addAdminToDb = async (id: string, password: string): Promise<boolean> => {
    try {
        const db = await getDb();
        const existingAdmin = await findAdminById(id);
        if (existingAdmin) return false;

        await db.collection('admins').insertOne({ id, password });
        return true;
    } catch (e) {
        console.error('Database error adding admin:', e);
        return false;
    }
};

export const removeAdminFromDb = async (id: string): Promise<boolean> => {
    try {
        const db = await getDb();
        const result = await db.collection('admins').deleteOne({ id: id });
        return result.deletedCount === 1;
    } catch (e) {
        console.error('Database error removing admin:', e);
        return false;
    }
};

// ================================================================= //
//                        ORDER DATA SERVICE (DB)                      //
// ================================================================= //

export const getOrdersFromDb = async (): Promise<Order[]> => {
    try {
        const db = await getDb();
        const orders = await db.collection('orders').find({}).sort({ date: -1 }).toArray();
        return orders.map(order => mapFromDb(order as OrderDb));
    } catch (e) {
        console.error('Database error fetching orders:', e);
        return [];
    }
};

export const addOrderToDb = async (orderData: Omit<Order, 'id'>): Promise<Order | null> => {
    try {
        const db = await getDb();
        const result = await db.collection('orders').insertOne(orderData);
        if (result.insertedId) {
            const newOrder = await db.collection('orders').findOne({ _id: result.insertedId });
            return mapFromDb(newOrder as OrderDb);
        }
        return null;
    } catch (e) {
        console.error('Database error adding order:', e);
        return null;
    }
};

export const updateOrderItemStatusInDb = async (orderId: string, itemId: string, newStatus: string): Promise<boolean> => {
    try {
        const db = await getDb();
        const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(orderId), "items.id": itemId },
            { $set: { "items.$.status": newStatus } }
        );
        return result.modifiedCount === 1;
    } catch (e) {
        console.error('Database error updating order status:', e);
        return false;
    }
};

// ================================================================= //
//                       ANALYTICS SERVICE (DB)                        //
// ================================================================= //

export const updatePurchaseCountsInDb = async (purchasedItems: CartItem[]): Promise<void> => {
    try {
        const db = await getDb();
        const bulkOps = purchasedItems.map(item => ({
            updateOne: {
                filter: { _id: "purchaseCounts" },
                update: { $inc: { [item.id]: item.quantity } },
                upsert: true
            }
        }));
        if (bulkOps.length > 0) {
            await db.collection('analytics').bulkWrite(bulkOps);
        }
    } catch (e) {
        console.error('Database error updating purchase counts:', e);
    }
};

export const getPurchaseCountsFromDb = async (): Promise<Record<string, number>> => {
    try {
        const db = await getDb();
        const doc = await db.collection('analytics').findOne({ _id: "purchaseCounts" });
        if (!doc) return {};
        const { _id, ...counts } = doc;
        return counts as Record<string, number>;
    } catch (e) {
        console.error('Database error fetching purchase counts:', e);
        return {};
    }
};

export const getVisitorDataFromDb = async (): Promise<{ count: number }> => {
    try {
        const db = await getDb();
        const doc = await db.collection('analytics').findOne({ _id: "visitorData" });
        return doc ? { count: doc.count as number } : { count: 0 };
    } catch (e) {
        console.error('Database error fetching visitor data:', e);
        return { count: 0 };
    }
};

export const incrementVisitorCountInDb = async (): Promise<number> => {
    try {
        const db = await getDb();
        const result = await db.collection('analytics').findOneAndUpdate(
            { _id: "visitorData" },
            { $inc: { count: 1 } },
            { upsert: true, returnDocument: 'after' }
        );
        return result?.count as number || 1;
    } catch (e) {
        console.error('Database error incrementing visitor count:', e);
        return 0; // Or handle error appropriately
    }
};

// ================================================================= //
//                 LOCAL STORAGE (CLIENT-SIDE ONLY)                  //
// ================================================================= //

// Helper for safe localStorage access, intended for use in client components/contexts
const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try { return window.localStorage.getItem(key); }
        catch (e) { console.warn(`LocalStorage read error:`, e); return null; }
    },
    setItem: (key: string, value: string): void => {
        try { window.localStorage.setItem(key, value); }
        catch (e) { console.warn(`LocalStorage write error:`, e); }
    },
    removeItem: (key: string): void => {
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
