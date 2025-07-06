
import { checkoutSchema } from "@/lib/schemas";
import { z } from "zod";
import type { ObjectId } from 'mongodb';

export type Category = "Men" | "Women" | "Kids" | "Ethnic" | "Western";

// This is the shape of the data as it is stored in the database
export interface ClothingItemDb {
  _id?: ObjectId;
  title: string;
  description: string;
  price: number;
  discount?: number;
  size: string;
  colors: string;
  category: Category;
  brand?: string;
  imageUrls: string[];
  imageHints?: string[];
  specifications?: string[];
  adminId?: string;
}

// This is the shape of the data used in the application frontend
export interface ClothingItem extends Omit<ClothingItemDb, '_id'> {
  id: string; // The _id from Mongo, converted to a string
  finalPrice: number;
  searchableText: string;
}

export type CartItem = ClothingItem & {
  quantity: number;
};

export type CheckoutDetails = z.infer<typeof checkoutSchema>;

export type OrderStatus = 'Placed' | 'Shipped' | 'Delivered' | 'Cancelled';

export type OrderItem = CartItem & {
  status: OrderStatus;
};

// Shape of order data in the DB
export interface OrderDb {
  _id?: ObjectId;
  date: string;
  items: OrderItem[];
  customerDetails: CheckoutDetails;
  totalAmount: number;
}
// Shape of order data in the frontend
export interface Order extends Omit<OrderDb, '_id'> {
  id: string;
}


// Shape of admin user data in the DB
export interface AdminUserDb {
    _id?: ObjectId;
    id: string; // The admin's username/ID
    password?: string;
    role: 'admin' | 'superadmin';
}

// Shape of admin user data in the frontend (password omitted)
export interface AdminUser {
    id: string;
    role: 'admin' | 'superadmin';
}

// Status for admin creation process
export type AdminCreationStatus = 'SUCCESS' | 'ALREADY_EXISTS' | 'CONFLICTS_WITH_SUPERADMIN' | 'ERROR';
