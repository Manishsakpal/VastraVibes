
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClothingItem, CartItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This function takes raw item data (with 'id' string) and adds calculated fields
export const processRawItems = (items: (Omit<ClothingItem, 'finalPrice' | 'searchableText'>)[]): ClothingItem[] => {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => {
    // Defensively handle potential non-numeric or missing values
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;

    const finalPrice = (discount > 0 && discount <= 100)
      ? price * (1 - discount / 100)
      : price;
    
    // Safely construct searchable text, ignoring any null or undefined fields
    const searchableText = [
      item.title,
      item.description,
      item.colors,
      item.size,
      item.category,
      item.brand,
    ].filter(Boolean).join(' ').toLowerCase();

    return { 
        ...item,
        price,
        discount, 
        finalPrice: Math.max(0, finalPrice), // Ensure final price is not negative
        searchableText 
    } as ClothingItem;
  });
};

const DEFAULT_PLACEHOLDER = 'https://placehold.co/600x800.png';

// This function now validates that image URLs are well-formed http/https links or valid data URIs.
// It will attempt to fix web URLs that are missing a protocol.
// If an invalid URL is found, it is removed. A placeholder is used if no valid URLs remain.
export function sanitizeItems<T extends (Omit<ClothingItem, 'finalPrice' | 'searchableText'> | CartItem)>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    let imageUrls = (Array.isArray(item.imageUrls) ? item.imageUrls : [])
      .map(url => {
        if (typeof url !== 'string' || !url.trim()) return null;
        
        const trimmedUrl = url.trim();

        // Check for valid data URI first
        if (trimmedUrl.startsWith('data:image/')) {
          return trimmedUrl;
        }

        // Handle web URLs
        let webUrl = trimmedUrl;
        if (!webUrl.startsWith('http://') && !webUrl.startsWith('https://')) {
          webUrl = 'https://' + webUrl;
        }

        try {
          // Final validation to ensure it's a parseable web URL
          new URL(webUrl);
          return webUrl;
        } catch (e) {
          // If it's still invalid after attempting to fix, discard it
          console.warn(`Invalid URL provided and could not be sanitized: ${url}`);
          return null;
        }
      })
      .filter((url): url is string => !!url); // Remove nulls and get an array of valid URLs

    // If no valid URLs are left after cleaning, add a default placeholder
    if (imageUrls.length === 0) {
      imageUrls.push(DEFAULT_PLACEHOLDER);
    }

    // Return a new item object with sanitized data
    return {
      ...item,
      imageUrls: imageUrls,
    };
  });
}
