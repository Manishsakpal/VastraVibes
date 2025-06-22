import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClothingItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ALLOWED_IMAGE_HOSTNAMES = [
  'placehold.co',
  'images.unsplash.com',
  'plus.unsplash.com',
];
const DEFAULT_PLACEHOLDER = 'https://placehold.co/600x800.png';

export const sanitizeItems = <T extends ClothingItem>(items: T[]): T[] => {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls : [];
    const sanitizedUrls = imageUrls.map(url => {
      if (typeof url !== 'string') return DEFAULT_PLACEHOLDER;
      try {
        const hostname = new URL(url).hostname;
        if (ALLOWED_IMAGE_HOSTNAMES.some(allowedHost => hostname === allowedHost || hostname.endsWith('.' + allowedHost))) {
          return url;
        }
      } catch (e) {
        // Invalid URL format, fall through to return placeholder
      }
      return DEFAULT_PLACEHOLDER;
    });

    // If after sanitizing, there are no images, add a placeholder
    if (sanitizedUrls.length === 0) {
        sanitizedUrls.push(DEFAULT_PLACEHOLDER);
    }

    return {
      ...item,
      imageUrls: sanitizedUrls,
    };
  });
};
