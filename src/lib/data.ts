import { initialItems as rawInitialItems } from '@/lib/mock-data';
import type { ClothingItem } from '@/types';

// Helper function to add performance-optimized fields
const processRawItems = (items: Omit<ClothingItem, 'finalPrice' | 'searchableText'>[]): ClothingItem[] => {
  return items.map(item => {
    const finalPrice = (item.discount && item.discount > 0)
      ? item.price * (1 - item.discount / 100)
      : item.price;
    
    const searchableText = [
      item.title,
      item.description,
      item.colors,
      item.size,
      item.category
    ].join(' ').toLowerCase();

    return { ...item, finalPrice, searchableText };
  });
};

const allItems = processRawItems(rawInitialItems);

// Simulates fetching all items from a database
export function getItems(): ClothingItem[] {
  return allItems;
}

// Simulates fetching a single item by ID from a database
export function getItem(id: string): ClothingItem | undefined {
  return allItems.find(item => item.id === id);
}
