import { checkoutSchema } from "@/lib/schemas";
import { z } from "zod";

export type Category = "Men" | "Women" | "Kids" | "Ethnic" | "Western";

export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number; // e.g., 20 for 20% off
  size: string; // e.g., "S, M, L" or "Free Size"
  colors: string; // e.g., "Red, Blue, Black"
  category: Category;
  imageUrls: string[];
  imageHints?: string[]; // For placeholder image generation hint
  specifications?: string[];
  adminId?: string; // ID of the admin who owns this product
  
  // Added for performance optimization
  finalPrice: number;
  searchableText: string;
}

export type CartItem = ClothingItem & {
  quantity: number;
};

export type CheckoutDetails = z.infer<typeof checkoutSchema>;

export interface Order {
  id: string;
  date: string; // ISO date string
  items: CartItem[];
  customerDetails: CheckoutDetails;
  totalAmount: number;
}

export interface AdminUser {
  id: string;
  password?: string;
  name: string;
}
