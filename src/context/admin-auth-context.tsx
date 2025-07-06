
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SUPERADMIN_ID, SUPERADMIN_PASSWORD } from '@/lib/constants';
import {
  getAdminsFromDb,
  addAdminToDb,
  removeAdminFromDb,
  findAdminById,
} from '@/lib/data-service';
import {
  getAuthStatusFromStorage,
  saveAuthStatusToStorage,
  clearAuthStatusInStorage,
} from '@/lib/client-data-service';
import type { AdminUser } from '@/types';

interface AdminAuthContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  currentAdminId: string | null;
  admins: AdminUser[];
  login: (id: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addAdmin: (id: string, pass: string) => Promise<boolean>;
  removeAdmin: (id: string) => Promise<void>;
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

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      const storedAdminsPromise = getAdminsFromDb();
      const authStatus = getAuthStatusFromStorage();
      
      const storedAdmins = await storedAdminsPromise;
      setAdmins(storedAdmins);
      
      if (authStatus.isSuperAdmin) {
          setIsSuperAdmin(true);
          setIsAdmin(false);
          setCurrentAdminId(authStatus.adminId);
      } else if (authStatus.isAdmin) {
          setIsAdmin(true);
          setIsSuperAdmin(false);
          setCurrentAdminId(authStatus.adminId);
      }

      setIsLoading(false);
    };
    loadInitialData();
  }, []);
  
  const login = useCallback(async (id: string, pass: string): Promise<boolean> => {
    // Super Admin login is hardcoded and doesn't hit the DB for credentials
    if (id === SUPERADMIN_ID && pass === SUPERADMIN_PASSWORD) {
        saveAuthStatusToStorage({ isSuperAdmin: true, adminId: SUPERADMIN_ID });
        setIsSuperAdmin(true);
        setIsAdmin(false);
        setCurrentAdminId(SUPERADMIN_ID);
        return true;
    }

    const adminUser = await findAdminById(id);
    if (adminUser && adminUser.password === pass) {
        saveAuthStatusToStorage({ isAdmin: true, adminId: adminUser.id });
        setIsAdmin(true);
        setIsSuperAdmin(false);
        setCurrentAdminId(adminUser.id);
        return true;
    }

    return false;
  }, []);

  const logout = useCallback(async () => {
    clearAuthStatusInStorage();
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setCurrentAdminId(null);
    router.push('/admin/login');
  }, [router]);

  const addAdmin = useCallback(async (id: string, password: string): Promise<boolean> => {
    const success = await addAdminToDb(id, password);
    if (success) {
      setAdmins(prevAdmins => [...prevAdmins, { id }]);
      return true;
    }
    return false;
  }, []);

  const removeAdmin = useCallback(async (id: string) => {
    const success = await removeAdminFromDb(id);
    if (success) {
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== id));
    }
  }, []);

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
