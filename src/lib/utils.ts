import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClothingItem, CartItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simplified sanitizer. It no longer filters by hostname.
// It ensures the data structure is correct and provides a fallback.
// Next.js's own image component will handle hostname validation errors.
export function sanitizeItems<T extends ClothingItem | CartItem>(items: T[]): T[] {
  // Return empty array if input is not a valid array
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    // Ensure imageUrls is an array of non-empty strings
    const imageUrls = (Array.isArray(item.imageUrls) ? item.imageUrls : [])
      .map(url => (typeof url === 'string' ? url.trim() : ''))
      .filter(Boolean); // Remove empty or null strings

    // If no valid URLs are left after cleaning, add a default placeholder
    if (imageUrls.length === 0) {
      imageUrls.push('https://placehold.co/600x800.png');
    }

    // Return a new item object with sanitized data
    return {
      ...item,
      imageUrls: imageUrls,
    };
  });
}
