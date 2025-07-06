
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LAST_VISIT_KEY } from '@/lib/constants';
import { getVisitorDataFromStorage, saveVisitorDataToStorage } from '@/lib/data-service';

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
    const trackVisitor = async () => {
        setIsLoading(true);
        const { count, lastVisit } = await getVisitorDataFromStorage();
        const now = Date.now();
        
        let currentCount = count;

        if (!lastVisit || (now - lastVisit) > VISIT_SESSION_DURATION) {
            // It's a new session/visit
            currentCount += 1;
            await saveVisitorDataToStorage({ count: currentCount, lastVisit: now });
        }
        
        setVisitorCount(currentCount);
        setIsLoading(false);
    }
    trackVisitor();
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
