import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClothingItem, CartItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define allowed hostnames for next/image
const ALLOWED_HOSTNAMES = ['images.unsplash.com', 'plus.unsplash.com', 'placehold.co'];

// Check if a URL is valid and from an allowed host
const isValidUrl = (url: string): boolean => {
  try {
    // Ensure the URL is a string and not empty
    if (typeof url !== 'string' || !url) {
      return false;
    }
    const urlObj = new URL(url);
    return ALLOWED_HOSTNAMES.includes(urlObj.hostname);
  } catch (e) {
    // Catches invalid URL formats
    return false;
  }
};

// Generic function to sanitize items (both ClothingItem and CartItem)
export function sanitizeItems<T extends ClothingItem | CartItem>(items: T[]): T[] {
  // Return empty array if input is not a valid array
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    // Ensure imageUrls is an array, default to empty array if not
    const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls : [];
    
    // Filter and sanitize URLs
    const sanitizedUrls = imageUrls
      .filter(url => isValidUrl(url)); // Keep only valid URLs

    // If after sanitization no valid URLs remain, add a default placeholder
    if (sanitizedUrls.length === 0) {
      sanitizedUrls.push('https://placehold.co/600x800.png');
    }

    // Return a new item object with sanitized data
    return {
      ...item,
      imageUrls: sanitizedUrls,
    };
  });
}
