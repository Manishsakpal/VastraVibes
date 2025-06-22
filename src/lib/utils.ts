import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClothingItem, CartItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ALLOWED_HOSTNAMES = ['placehold.co', 'images.unsplash.com', 'plus.unsplash.com', 'encrypted-tbn0.gstatic.com'];
const DEFAULT_PLACEHOLDER = 'https://placehold.co/600x800.png';

// This function now enforces that all image URLs are from allowed hostnames.
// If an invalid URL is found, it is replaced by a default placeholder.
export function sanitizeItems<T extends ClothingItem | CartItem>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    // Ensure imageUrls is an array of valid strings from allowed hosts
    let imageUrls = (Array.isArray(item.imageUrls) ? item.imageUrls : [])
      .map(url => {
        if (typeof url !== 'string' || !url.trim()) return null;
        try {
          const urlObject = new URL(url.trim());
          if (ALLOWED_HOSTNAMES.includes(urlObject.hostname)) {
            return urlObject.href;
          }
        } catch (e) {
          // Invalid URL format, ignore
          return null;
        }
        return null; // Hostname not allowed
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
