
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SUPERADMIN_ID, 
  SUPERADMIN_PASSWORD, 
  INITIAL_ADMIN_USERS,
} from '@/lib/constants';
import {
  getAdminsFromStorage,
  saveAdminsToStorage,
  getAuthStatusFromStorage,
  saveAuthStatusToStorage,
  clearAuthStatusInStorage,
} from '@/lib/data-service';
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
        const [storedAdmins, authStatus] = await Promise.all([
            getAdminsFromStorage(),
            getAuthStatusFromStorage(),
        ]);
        
        // Initialize with default admins if storage is empty
        if (storedAdmins.length === 0) {
            setAdmins(INITIAL_ADMIN_USERS);
            await saveAdminsToStorage(INITIAL_ADMIN_USERS);
        } else {
            setAdmins(storedAdmins);
        }
        
        if (authStatus.isSuperAdmin) {
            setIsSuperAdmin(true);
            setIsAdmin(false); // Ensure states are mutually exclusive
            setCurrentAdminId(authStatus.adminId);
        } else if (authStatus.isAdmin) {
            setIsAdmin(true);
            setIsSuperAdmin(false); // Ensure states are mutually exclusive
            setCurrentAdminId(authStatus.adminId);
        }
        setIsLoading(false);
    };
    loadInitialData();
  }, []);
  
  const login = useCallback(async (id: string, pass: string): Promise<boolean> => {
    // Check for Super Admin
    if (id === SUPERADMIN_ID && pass === SUPERADMIN_PASSWORD) {
        await saveAuthStatusToStorage({ isSuperAdmin: true, adminId: SUPERADMIN_ID });
        setIsSuperAdmin(true);
        setIsAdmin(false);
        setCurrentAdminId(SUPERADMIN_ID);
        return true;
    }

    // Check for Regular Admin
    const adminUser = admins.find(admin => admin.id === id && admin.password === pass);
    if (adminUser) {
        await saveAuthStatusToStorage({ isAdmin: true, adminId: adminUser.id });
        setIsAdmin(true);
        setIsSuperAdmin(false);
        setCurrentAdminId(adminUser.id);
        return true;
    }

    return false;
  }, [admins]);

  const logout = useCallback(async () => {
    await clearAuthStatusInStorage();
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setCurrentAdminId(null);
    router.push('/admin/login');
  }, [router]);

  const addAdmin = useCallback(async (id: string, password: string): Promise<boolean> => {
    const adminExists = admins.some(admin => admin.id === id);
    if(adminExists) return false;

    const newAdmins = [...admins, { id, password }];
    setAdmins(newAdmins);
    await saveAdminsToStorage(newAdmins);
    return true;
  }, [admins]);

  const removeAdmin = useCallback(async (id: string) => {
    const newAdmins = admins.filter(admin => admin.id !== id);
    setAdmins(newAdmins);
    await saveAdminsToStorage(newAdmins);
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
