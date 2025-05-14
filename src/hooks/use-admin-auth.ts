"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_ID, ADMIN_PASSWORD, AUTH_TOKEN_KEY } from '@/lib/constants';

interface AdminAuth {
  isAdmin: boolean;
  login: (id: string, pass: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

export const useAdminAuth = (): AdminAuth => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
    setIsLoading(true);
    if (id === ADMIN_ID && pass === ADMIN_PASSWORD) {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, 'true');
      } catch (error) {
         console.warn("Could not set admin auth in localStorage:", error);
      }
      setIsAdmin(true);
      setIsLoading(false);
      return true;
    }
    setIsAdmin(false);
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.warn("Could not remove admin auth from localStorage:", error);
    }
    setIsAdmin(false);
    setIsLoading(false);
    router.push('/admin/login');
  }, [router]);

  return { isAdmin, login, logout, isLoading };
};
