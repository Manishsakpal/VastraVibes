
"use client";

import React, { useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/types";
import { Shirt, PersonStanding, Baby, Palette, LayoutGrid, List } from 'lucide-react';
import { useTheme, categoryToTheme, themeToCategory } from '@/context/theme-context';

const ALL_CATEGORIES: (Category | 'All')[] = ['All', 'Men', 'Women', 'Kids', 'Ethnic', 'Western'];

const categoryIcons: { [key in Category | 'All']: React.ElementType } = {
  All: List,
  Men: Shirt,
  Women: PersonStanding,
  Kids: Baby,
  Ethnic: Palette,
  Western: LayoutGrid,
};

const CategorySelector = () => {
  const { theme, setTheme } = useTheme();
  const selectedCategory = themeToCategory(theme);

  const handleSelectCategory = useCallback((category: Category | 'All') => {
    setTheme(categoryToTheme(category));
  }, [setTheme]);

  return (
    <Tabs value={selectedCategory} onValueChange={(value) => handleSelectCategory(value as Category | 'All')} className="w-full overflow-x-auto">
      <TabsList className="flex-col h-auto sm:h-10 sm:flex-row w-full justify-start sm:justify-center sm:w-auto mx-auto bg-card p-1 rounded-lg shadow-sm">
        {ALL_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category];
          return (
            <TabsTrigger
              key={category}
              value={category}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
              aria-label={`Filter by ${category} category`}
            >
              <Icon className="h-4 w-4" />
              {category}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default React.memo(CategorySelector);
