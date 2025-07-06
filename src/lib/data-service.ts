
'use server';

import type { ClothingItem, ClothingItemDb, AdminUser, AdminUserDb, Order, OrderDb, CartItem, OrderStatus, AdminCreationStatus } from '@/types';
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

// ================================================================= //
//                      DATABASE HELPER FUNCTIONS                      //
// ================================================================= //

const getDb = async () => {
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    throw new Error('DB_NAME environment variable is not configured.');
  }
  const client = await clientPromise;
  return client.db(dbName);
}

// Map MongoDB's _id to a string id for frontend use, now with added safety checks
const mapFromDb = <T extends { _id?: ObjectId }>(doc: T | null | undefined): (Omit<T, '_id'> & { id: string }) | null => {
  if (!doc || !doc._id) {
    return null;
  }
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toHexString() };
};

const logDbError = (error: any, functionName: string) => {
    console.error('============================================================');
    console.error(`DATABASE ERROR in ${functionName}:`);
    console.error('This is a server-side error. Check your server console.');
    console.error('Potential causes:');
    console.error('1. The MONGODB_URI in your .env.local file is incorrect.');
    console.error('2. The database USER was deleted or has the wrong password.');
    console.error('3. The IP address is not whitelisted in MongoDB Atlas (Network Access).');
    console.error('4. The MongoDB cluster is paused.');
    console.error('--- Original Error Message ---');
    console.error(error);
    console.error('============================================================');
}

// ================================================================= //
//                        ITEM DATA SERVICE (DB)                       //
// ================================================================= //

export const getItemsFromDb = async (): Promise<(Omit<ClothingItem, 'finalPrice' | 'searchableText'>)[]> => {
  try {
    const db = await getDb();
    const items = await db.collection('items').find({}).toArray();
    
    // Use a robust mapping that filters out any null values from bad data
    return items
        .map(item => mapFromDb(item as ClothingItemDb))
        .filter((item): item is (Omit<ClothingItem, 'finalPrice' | 'searchableText'>) => !!item);

  } catch (e) {
    logDbError(e, 'getItemsFromDb');
    return [];
  }
}

export const getSingleItemFromDb = async (itemId: string): Promise<Omit<ClothingItem, 'finalPrice' | 'searchableText'> | null> => {
    try {
        if (!ObjectId.isValid(itemId)) {
            console.warn(`Invalid item ID format: ${itemId}`);
            return null;
        }
        const db = await getDb();
        const item = await db.collection('items').findOne({ _id: new ObjectId(itemId) });
        return mapFromDb(item as ClothingItemDb);
    } catch (e) {
        logDbError(e, 'getSingleItemFromDb');
        return null;
    }
}

export const addItemToDb = async (itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>): Promise<(Omit<ClothingItem, 'finalPrice' | 'searchableText'>) | null> => {
    try {
        const db = await getDb();
        const result = await db.collection('items').insertOne(itemData);
        if (result.insertedId) {
            const insertedDoc = await db.collection('items').findOne({ _id: result.insertedId });
            return mapFromDb(insertedDoc as ClothingItemDb);
        }
        return null;
    } catch (e) {
        logDbError(e, 'addItemToDb');
        return null;
    }
};

export const updateItemInDb = async (itemId: string, itemData: Omit<ClothingItem, 'id' | 'finalPrice' | 'searchableText'>): Promise<(Omit<ClothingItem, 'finalPrice' | 'searchableText'>) | null> => {
    try {
        const db = await getDb();
        const result = await db.collection('items').findOneAndUpdate(
            { _id: new ObjectId(itemId) },
            { $set: itemData },
            { returnDocument: 'after' }
        );
        return result ? mapFromDb(result as ClothingItemDb) : null;
    } catch (e) {
        logDbError(e, 'updateItemInDb');
        return null;
    }
};

export const deleteItemFromDb = async (itemId: string): Promise<boolean> => {
    try {
        const db = await getDb();
        const result = await db.collection('items').deleteOne({ _id: new ObjectId(itemId) });
        return result.deletedCount === 1;
    } catch (e) {
        logDbError(e, 'deleteItemFromDb');
        return false;
    }
};


// ================================================================= //
//                        ADMIN DATA SERVICE (DB)                      //
// ================================================================= //

export const verifyAdminCredentials = async (id: string, pass: string): Promise<{ adminId: string; role: 'admin' | 'superadmin' } | null> => {
    // 1. Check for Super Admin credentials from environment variables
    if (id === process.env.SUPERADMIN_ID && pass === process.env.SUPERADMIN_PASSWORD) {
        return { adminId: id, role: 'superadmin' };
    }

    // 2. If not Super Admin, check the database for a standard admin
    try {
        const db = await getDb();
        const admin = await db.collection('admins').findOne<AdminUserDb>({ id: id });

        if (admin && admin.password === pass) {
            // Ensure only 'admin' role can be fetched from DB this way
            if (admin.role === 'admin') {
                return { adminId: admin.id, role: 'admin' };
            }
        }
    } catch (e) {
        logDbError(e, 'verifyAdminCredentials');
        return null;
    }

    // 3. If no match found
    return null;
};

export const getAdminsFromDb = async (): Promise<AdminUser[]> => {
    try {
        const db = await getDb();
        const admins = await db.collection('admins').find({}).project({ password: 0 }).toArray();
        return admins
            .map(admin => mapFromDb(admin as AdminUserDb))
            .filter((admin): admin is AdminUser => !!admin);
    } catch (e) {
        logDbError(e, 'getAdminsFromDb');
        return [];
    }
};

export const addAdminToDb = async (id: string, password: string): Promise<AdminCreationStatus> => {
    try {
        const db = await getDb();
        
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
        logDbError(e, 'addAdminToDb');
        return 'ERROR';
    }
};

export const removeAdminFromDb = async (id: string): Promise<boolean> => {
    try {
        const db = await getDb();
        const result = await db.collection('admins').deleteOne({ id: id });
        return result.deletedCount === 1;
    } catch (e) {
        logDbError(e, 'removeAdminFromDb');
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
        return orders
            .map(order => mapFromDb(order as OrderDb))
            .filter((order): order is Order => !!order);
    } catch (e) {
        logDbError(e, 'getOrdersFromDb');
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
        logDbError(e, 'addOrderToDb');
        return null;
    }
};

export const updateOrderItemStatusInDb = async (orderId: string, itemId: string, newStatus: OrderStatus): Promise<boolean> => {
    try {
        const db = await getDb();
        const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(orderId), "items.id": itemId },
            { $set: { "items.$.status": newStatus } }
        );
        return result.modifiedCount === 1;
    } catch (e) {
        logDbError(e, 'updateOrderItemStatusInDb');
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
        logDbError(e, 'updatePurchaseCountsInDb');
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
        logDbError(e, 'getPurchaseCountsFromDb');
        return {};
    }
};

export const getVisitorDataFromDb = async (): Promise<{ count: number }> => {
    try {
        const db = await getDb();
        const doc = await db.collection('analytics').findOne({ _id: "visitorData" });
        return doc ? { count: doc.count as number } : { count: 0 };
    } catch (e) {
        logDbError(e, 'getVisitorDataFromDb');
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
        logDbError(e, 'incrementVisitorCountInDb');
        return 0; // Or handle error appropriately
    }
};

    