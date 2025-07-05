
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SUPERADMIN_ID, 
  SUPERADMIN_PASSWORD, 
  INITIAL_ADMIN_USERS,
  AUTH_TOKEN_KEY, 
  SUPERADMIN_AUTH_TOKEN_KEY,
  ADMIN_USERS_STORAGE_KEY,
  CURRENT_ADMIN_ID_KEY,
} from '@/lib/constants';
import type { AdminUser } from '@/types';

interface AdminAuthContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  currentAdminId: string | null;
  admins: AdminUser[];
  login: (id: string, pass: string) => boolean;
  logout: () => void;
  addAdmin: (id: string, pass: string) => boolean;
  removeAdmin: (id: string) => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load admins and check auth status on initial load
  useEffect(() => {
    setIsLoading(true);
    try {
      // Load admin users list
      const storedAdmins = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
      setAdmins(storedAdmins ? JSON.parse(storedAdmins) : INITIAL_ADMIN_USERS);

      // Check auth status
      const regularAuth = localStorage.getItem(AUTH_TOKEN_KEY);
      const superAuth = localStorage.getItem(SUPERADMIN_AUTH_TOKEN_KEY);
      const storedAdminId = localStorage.getItem(CURRENT_ADMIN_ID_KEY);

      if (superAuth === 'true') {
        setIsSuperAdmin(true);
        setCurrentAdminId(SUPERADMIN_ID);
      } else if (regularAuth === 'true' && storedAdminId) {
        setIsAdmin(true);
        setCurrentAdminId(storedAdminId);
      }
    } catch (error) {
      console.warn("Could not access localStorage for admin setup:", error);
      setAdmins(INITIAL_ADMIN_USERS); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAdminStorage = (updatedAdmins: AdminUser[]) => {
    try {
      localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(updatedAdmins));
    } catch (error) {
      console.error("Failed to save admins to localStorage", error);
    }
  };
  
  const login = useCallback((id: string, pass: string): boolean => {
    // Check for Super Admin
    if (id === SUPERADMIN_ID && pass === SUPERADMIN_PASSWORD) {
      try {
        localStorage.setItem(SUPERADMIN_AUTH_TOKEN_KEY, 'true');
        localStorage.setItem(CURRENT_ADMIN_ID_KEY, SUPERADMIN_ID);
        setIsSuperAdmin(true);
        setIsAdmin(false);
        setCurrentAdminId(SUPERADMIN_ID);
        return true;
      } catch (error) {
         console.warn("Could not set super admin auth in localStorage:", error);
         return false;
      }
    }

    // Check for Regular Admin
    const adminUser = admins.find(admin => admin.id === id && admin.password === pass);
    if (adminUser) {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, 'true');
        localStorage.setItem(CURRENT_ADMIN_ID_KEY, adminUser.id);
        setIsAdmin(true);
        setIsSuperAdmin(false);
        setCurrentAdminId(adminUser.id);
        return true;
      } catch (error) {
         console.warn("Could not set admin auth in localStorage:", error);
         return false;
      }
    }

    return false;
  }, [admins]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(SUPERADMIN_AUTH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_ADMIN_ID_KEY);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setCurrentAdminId(null);
      router.push('/admin/login');
    } catch (error) {
      console.warn("Could not remove admin auth from localStorage:", error);
    }
  }, [router]);

  const addAdmin = useCallback((id: string, password: string): boolean => {
    const adminExists = admins.some(admin => admin.id === id);
    if(adminExists) return false;

    const newAdmins = [...admins, { id, password }];
    setAdmins(newAdmins);
    updateAdminStorage(newAdmins);
    return true;
  }, [admins]);

  const removeAdmin = useCallback((id: string) => {
    const newAdmins = admins.filter(admin => admin.id !== id);
    setAdmins(newAdmins);
    updateAdminStorage(newAdmins);
  }, [admins]);

  const value = { isAdmin, isSuperAdmin, currentAdminId, admins, login, logout, addAdmin, removeAdmin, isLoading };

  return (
    <AdminAuthContext.Provider value={value}>
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
