
'use server';

import type { ClothingItem, ClothingItemDb, AdminUser, AdminUserDb, Order, OrderDb, CartItem, OrderStatus, AdminCreationStatus } from '@/types';
import clientPromise from './mongodb';
import { ObjectId, type Db } from 'mongodb';

// ================================================================= //
//                      DATABASE HELPER FUNCTIONS                      //
// ================================================================= //

const getDb = async (): Promise<Db | null> => {
  try {
    // These variables are loaded from the Vercel environment, not from .env.local in production.
    const dbName = process.env.DB_NAME;
    
    // During the build process (`next build`), these may not be available.
    // We check for them here and return null to prevent the build from crashing.
    if (!dbName) {
      console.warn("DB_NAME environment variable is not configured. Database operations will be skipped.");
      return null;
    }
    
    const client = await clientPromise; // This promise handles the MONGODB_URI internally.
    return client.db(dbName);

  } catch (e) {
    // This will catch a rejected clientPromise if MONGODB_URI is missing.
    console.error("Failed to establish database connection.", e);
    return null;
  }
}

// Map MongoDB's _id to a string id for frontend use, now with added safety checks
const mapFromDb = <T extends { _id?: ObjectId }>(doc: T | null | undefined): (Omit<T, '_id'> & { id: string }) | null => {
  if (!doc || !doc._id) {
    return null;
  }
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toHexString() };
};

// ================================================================= //
//                        ITEM DATA SERVICE (DB)                       //
// ================================================================= //

export const getItemsFromDb = async (): Promise<(Omit<ClothingItem, 'finalPrice' | 'searchableText'>)[]> => {
  const db = await getDb();
  if (!db) return []; // Graceful exit for build process

  try {
    const items = await db.collection('items').find({}).toArray();
    return items
        .map(item => mapFromDb(item as ClothingItemDb))
        .filter((item): item is (Omit<ClothingItem, 'finalPrice' | 'searchableText'>) => !!item);
  } catch (e) {
    console.error("Error in getItemsFromDb:", e);
    return [];
  }
}

export const getSingleItemFromDb = async (itemId: string): Promise<Omit<ClothingItem, 'finalPrice' | 'searchableText'> | null> => {
    const db = await getDb();
    if (!db) return null;

    try {
        if (!ObjectId.isValid(itemId)) {
            console.warn(`Invalid item ID format: ${itemId}`);
            return null;
        }
        const item = await db.collection('items').findOne({ _id: new ObjectId(itemId) });
        return mapFromDb(item as ClothingItemDb);
    } catch (e) {
        console.error("Error in getSingleItemFromDb:", e);
        return null;
    }
}

export const addItemToDb = async (itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>): Promise<(Omit<ClothingItem, 'finalPrice' | 'searchableText'>) | null> => {
    const db = await getDb();
    if (!db) return null;

    try {
        const result = await db.collection('items').insertOne(itemData);
        if (result.insertedId) {
            const insertedDoc = await db.collection('items').findOne({ _id: result.insertedId });
            return mapFromDb(insertedDoc as ClothingItemDb);
        }
        return null;
    } catch (e) {
        console.error("Error in addItemToDb:", e);
        return null;
    }
};

export const updateItemInDb = async (itemId: string, itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>): Promise<(Omit<ClothingItem, 'finalPrice' | 'searchableText'>) | null> => {
    const db = await getDb();
    if (!db) return null;

    try {
        const result = await db.collection('items').findOneAndUpdate(
            { _id: new ObjectId(itemId) },
            { $set: itemData },
            { returnDocument: 'after' }
        );
        return result ? mapFromDb(result as ClothingItemDb) : null;
    } catch (e) {
        console.error("Error in updateItemInDb:", e);
        return null;
    }
};

export const deleteItemFromDb = async (itemId: string): Promise<boolean> => {
    const db = await getDb();
    if (!db) return false;

    try {
        const result = await db.collection('items').deleteOne({ _id: new ObjectId(itemId) });
        return result.deletedCount === 1;
    } catch (e) {
        console.error("Error in deleteItemFromDb:", e);
        return false;
    }
};


// ================================================================= //
//                        ADMIN DATA SERVICE (DB)                      //
// ================================================================= //

export const verifyAdminCredentials = async (id: string, pass: string): Promise<{ adminId: string; role: 'admin' | 'superadmin' } | null> => {
    const superAdminId = process.env.SUPERADMIN_ID;
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

    // 1. Check for Super Admin credentials from environment variables
    if (superAdminId && superAdminPassword && id === superAdminId && pass === superAdminPassword) {
        return { adminId: id, role: 'superadmin' };
    }

    // 2. If not Super Admin, check the database for a standard admin
    const db = await getDb();
    if (!db) return null; // Can't check DB if it's not configured

    try {
        const admin = await db.collection('admins').findOne<AdminUserDb>({ id: id });
        if (admin && admin.password === pass && admin.role === 'admin') {
            return { adminId: admin.id, role: 'admin' };
        }
    } catch (e) {
        console.error("Error in verifyAdminCredentials:", e);
        return null;
    }

    // 3. If no match found
    return null;
};

export const getAdminsFromDb = async (): Promise<AdminUser[]> => {
    const db = await getDb();
    if (!db) return [];

    try {
        const admins = await db.collection('admins').find({}).project({ password: 0 }).toArray();
        return admins
            .map(admin => mapFromDb(admin as AdminUserDb))
            .filter((admin): admin is AdminUser => !!admin);
    } catch (e) {
        console.error("Error in getAdminsFromDb:", e);
        return [];
    }
};

export const addAdminToDb = async (id: string, password: string): Promise<AdminCreationStatus> => {
    const db = await getDb();
    if (!db) return 'ERROR';

    try {
        if (id === process.env.SUPERADMIN_ID) {
            console.error("Attempted to create a standard admin with the Super Admin ID.");
            return 'CONFLICTS_WITH_SUPERADMIN';
        }

        const existingAdmin = await db.collection('admins').findOne({ id: id });
        if (existingAdmin) {
            return 'ALREADY_EXISTS';
        }
        
        await db.collection('admins').insertOne({ id, password, role: 'admin' });
        return 'SUCCESS';
    } catch (e) {
        console.error("Error in addAdminToDb:", e);
        return 'ERROR';
    }
};

export const removeAdminFromDb = async (id: string): Promise<boolean> => {
    const db = await getDb();
    if (!db) return false;

    try {
        const result = await db.collection('admins').deleteOne({ id: id });
        return result.deletedCount === 1;
    } catch (e) {
        console.error("Error in removeAdminFromDb:", e);
        return false;
    }
};

// ================================================================= //
//                        ORDER DATA SERVICE (DB)                      //
// ================================================================= //

export const getOrdersFromDb = async (): Promise<Order[]> => {
    const db = await getDb();
    if (!db) return [];

    try {
        const orders = await db.collection('orders').find({}).sort({ date: -1 }).toArray();
        return orders
            .map(order => mapFromDb(order as OrderDb))
            .filter((order): order is Order => !!order);
    } catch (e) {
        console.error("Error in getOrdersFromDb:", e);
        return [];
    }
};

export const addOrderToDb = async (orderData: Omit<Order, 'id'>): Promise<Order | null> => {
    const db = await getDb();
    if (!db) return null;

    try {
        const result = await db.collection('orders').insertOne(orderData);
        if (result.insertedId) {
            const newOrder = await db.collection('orders').findOne({ _id: result.insertedId });
            return mapFromDb(newOrder as OrderDb);
        }
        return null;
    } catch (e) {
        console.error("Error in addOrderToDb:", e);
        return null;
    }
};

export const updateOrderItemStatusInDb = async (orderId: string, itemId: string, newStatus: OrderStatus): Promise<boolean> => {
    const db = await getDb();
    if (!db) return false;

    try {
        const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(orderId), "items.id": itemId },
            { $set: { "items.$.status": newStatus } }
        );
        return result.modifiedCount === 1;
    } catch (e) {
        console.error("Error in updateOrderItemStatusInDb:", e);
        return false;
    }
};

// ================================================================= //
//                       ANALYTICS SERVICE (DB)                        //
// ================================================================= //

export const updatePurchaseCountsInDb = async (purchasedItems: CartItem[]): Promise<void> => {
    const db = await getDb();
    if (!db) return;

    try {
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
        console.error("Error in updatePurchaseCountsInDb:", e);
    }
};

export const getPurchaseCountsFromDb = async (): Promise<Record<string, number>> => {
    const db = await getDb();
    if (!db) return {};

    try {
        const doc = await db.collection('analytics').findOne({ _id: "purchaseCounts" });
        if (!doc) return {};
        const { _id, ...counts } = doc;
        return counts as Record<string, number>;
    } catch (e) {
        console.error("Error in getPurchaseCountsFromDb:", e);
        return {};
    }
};

export const getVisitorDataFromDb = async (): Promise<{ count: number }> => {
    const db = await getDb();
    if (!db) return { count: 0 };

    try {
        const doc = await db.collection('analytics').findOne({ _id: "visitorData" });
        return doc ? { count: doc.count as number } : { count: 0 };
    } catch (e) {
        console.error("Error in getVisitorDataFromDb:", e);
        return { count: 0 };
    }
};

export const incrementVisitorCountInDb = async (): Promise<number> => {
    const db = await getDb();
    if (!db) return 0;
    
    try {
        const result = await db.collection('analytics').findOneAndUpdate(
            { _id: "visitorData" },
            { $inc: { count: 1 } },
            { upsert: true, returnDocument: 'after' }
        );
        return result?.count as number || 1;
    } catch (e) {
        console.error("Error in incrementVisitorCountInDb:", e);
        return 0;
    }
};
