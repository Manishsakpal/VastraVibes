
'use server';

import type { ClothingItem, ClothingItemDb, AdminUser, AdminUserDb, Order, OrderDb, CartItem, OrderStatus } from '@/types';
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
        console.error('Database error during admin verification:', e);
        return null;
    }

    // 3. If no match found
    return null;
};

export const getAdminsFromDb = async (): Promise<AdminUser[]> => {
    try {
        const db = await getDb();
        const admins = await db.collection('admins').find({}).project({ password: 0 }).toArray();
        return admins.map(admin => mapFromDb(admin as AdminUserDb) as AdminUser);
    } catch (e) {
        console.error('Database error fetching admins:', e);
        return [];
    }
};

export const addAdminToDb = async (id: string, password: string): Promise<boolean> => {
    try {
        const db = await getDb();
         // Prevent creating a standard admin with the same ID as the super admin
        if (id === process.env.SUPERADMIN_ID) {
            console.error("Attempted to create a standard admin with the Super Admin ID.");
            return false;
        }
        const existingAdmin = await db.collection('admins').findOne({ id: id });
        if (existingAdmin) return false;

        // All admins created via the app are standard admins
        await db.collection('admins').insertOne({ id, password, role: 'admin' });
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

export const updateOrderItemStatusInDb = async (orderId: string, itemId: string, newStatus: OrderStatus): Promise<boolean> => {
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
