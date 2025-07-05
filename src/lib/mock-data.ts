
import type { ClothingItem } from '@/types';

// This file is intentionally left with an empty array for initial items.
// All products should be added through the admin dashboard.

export const initialItems: Omit<ClothingItem, 'finalPrice' | 'searchableText'>[] = [];
