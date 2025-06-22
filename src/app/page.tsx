"use client";

import type { NextPage } from 'next';
import ItemList from '@/components/item-list';

const HomePage: NextPage = () => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary tracking-tight">Welcome to Vastra Vibes</h1>
        <p className="text-lg text-muted-foreground">Discover Your Unique Style</p>
      </header>
      
      <ItemList />
    </div>
  );
};

export default HomePage;
