
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getVisitorDataFromDb,
  incrementVisitorCountInDb,
} from '@/lib/data-service';
import {
  getLastVisitFromStorage,
  saveLastVisitToStorage
} from '@/lib/client-data-service';

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
        const lastVisit = getLastVisitFromStorage();
        const now = Date.now();
        
        let currentCount = 0;

        if (!lastVisit || (now - lastVisit) > VISIT_SESSION_DURATION) {
            // It's a new session/visit, update DB
            currentCount = await incrementVisitorCountInDb();
            saveLastVisitToStorage(now);
        } else {
            // It's a returning visit within the session, just get the count
            const data = await getVisitorDataFromDb();
            currentCount = data.count;
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
