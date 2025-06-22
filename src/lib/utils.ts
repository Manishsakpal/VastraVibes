import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClothingItem, CartItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ALLOWED_HOSTNAMES = ['images.unsplash.com', 'plus.unsplash.com', 'placehold.co'];

const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ALLOWED_HOSTNAMES.includes(urlObj.hostname);
  } catch (e) {
    return false;
  }
};

export function sanitizeItems<T extends ClothingItem | CartItem>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls : [];
    
    const sanitizedUrls = imageUrls
      .map(url => (typeof url === 'string' && isValidUrl(url) ? url : 'https://placehold.co/600x800.png'));

    if (sanitizedUrls.length === 0) {
      sanitizedUrls.push('https://placehold.co/600x800.png');
    }

    return {
      ...item,
      imageUrls: sanitizedUrls,
    };
  });
}
