"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VISITOR_COUNT_KEY, LAST_VISIT_KEY } from '@/lib/constants';

interface VisitorContextType {
  visitorCount: number;
  isLoading: boolean;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

const VISIT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const VisitorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
      const now = Date.now();
      
      let currentCount = parseInt(localStorage.getItem(VISITOR_COUNT_KEY) || '0', 10);

      if (!lastVisit || (now - parseInt(lastVisit, 10)) > VISIT_SESSION_DURATION) {
        // It's a new session/visit
        currentCount += 1;
        localStorage.setItem(VISITOR_COUNT_KEY, String(currentCount));
        localStorage.setItem(LAST_VISIT_KEY, String(now));
      }
      
      setVisitorCount(currentCount);

    } catch (error) {
      console.warn("Could not access localStorage for visitor tracking:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <VisitorContext.Provider value={{ visitorCount, isLoading }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitorContext = (): VisitorContextType => {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error('useVisitorContext must be used within a VisitorProvider');
  }
  return context;
};
