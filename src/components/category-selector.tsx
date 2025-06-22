
"use client";

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/types";
import { Shirt, PersonStanding, Baby, Palette, LayoutGrid, List } from 'lucide-react'; // Import icons

interface CategorySelectorProps {
  categories: (Category | 'All')[];
  selectedCategory: Category | 'All';
  onSelectCategory: (category: Category | 'All') => void;
}

const categoryIcons: { [key in Category | 'All']: React.ElementType } = {
  All: List,
  Men: Shirt,
  Women: PersonStanding,
  Kids: Baby,
  Ethnic: Palette,
  Western: LayoutGrid,
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <Tabs value={selectedCategory} onValueChange={(value) => onSelectCategory(value as Category | 'All')} className="w-full overflow-x-auto">
      <TabsList className="flex justify-start sm:justify-center w-max sm:w-auto mx-auto bg-card p-1 rounded-lg shadow-sm">
        {categories.map((category) => {
          const Icon = categoryIcons[category];
          return (
            <TabsTrigger
              key={category}
              value={category}
              className="flex items-center gap-2 px-3 py-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md rounded-md transition-all"
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
