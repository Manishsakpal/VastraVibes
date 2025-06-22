"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_ID, ADMIN_PASSWORD, AUTH_TOKEN_KEY } from '@/lib/constants';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (id: string, pass: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check auth status on initial load
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedAuth = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedAuth === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.warn("Could not access localStorage for admin auth:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((id: string, pass: string): boolean => {
    if (id === ADMIN_ID && pass === ADMIN_PASSWORD) {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, 'true');
        setIsAdmin(true);
        return true;
      } catch (error) {
         console.warn("Could not set admin auth in localStorage:", error);
         return false;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setIsAdmin(false);
      router.push('/admin/login');
    } catch (error) {
      console.warn("Could not remove admin auth from localStorage:", error);
    }
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
