"use client";

import React, { useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/types";
import { Shirt, PersonStanding, Baby, Palette, LayoutGrid, List } from 'lucide-react';
import { useTheme, categoryToTheme } from '@/context/theme-context';

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
  const { setTheme, selectedCategory } = useTheme();

  const handleSelectCategory = useCallback((category: Category | 'All') => {
    setTheme(categoryToTheme(category));
  }, [setTheme]);

  return (
    <>
      {/* Desktop View: Tabs */}
      <div className="hidden sm:block">
        <Tabs value={selectedCategory} onValueChange={(value) => handleSelectCategory(value as Category | 'All')} className="w-full">
          <TabsList className="h-10 w-full justify-start sm:justify-center sm:w-auto mx-auto bg-card p-1 rounded-lg shadow-sm">
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
      </div>

      {/* Mobile View: Select Dropdown */}
      <div className="block sm:hidden w-full">
        <Select value={selectedCategory} onValueChange={(value) => handleSelectCategory(value as Category | 'All')}>
          <SelectTrigger className="w-full text-base">
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            {ALL_CATEGORIES.map((category) => {
               const Icon = categoryIcons[category];
               return (
                <SelectItem key={category} value={category} className="text-base">
                   <div className="flex items-center gap-2">
                     <Icon className="h-4 w-4 text-muted-foreground" />
                     <span>{category}</span>
                   </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default React.memo(CategorySelector);