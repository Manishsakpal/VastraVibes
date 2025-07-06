
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAdminsFromDb,
  addAdminToDb,
  removeAdminFromDb,
  verifyAdminCredentials,
} from '@/lib/data-service';
import {
  getAuthSessionFromStorage,
  saveAuthSessionToStorage,
  clearAuthSessionInStorage,
} from '@/lib/client-data-service';
import type { AdminUser, AdminCreationStatus } from '@/types';

interface AdminAuthContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  currentAdminId: string | null;
  admins: AdminUser[];
  login: (id: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addAdmin: (id: string, pass: string) => Promise<AdminCreationStatus>;
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
      const authSession = getAuthSessionFromStorage();
      
      const storedAdmins = await storedAdminsPromise;
      setAdmins(storedAdmins.filter(a => a.role === 'admin')); // Superadmin dashboard only shows standard admins
      
      if (authSession) {
          if (authSession.role === 'superadmin') {
              setIsSuperAdmin(true);
          } else if (authSession.role === 'admin') {
              setIsAdmin(true);
          }
          setCurrentAdminId(authSession.adminId);
      }

      setIsLoading(false);
    };
    loadInitialData();
  }, []);
  
  const login = useCallback(async (id: string, pass: string): Promise<boolean> => {
    const authenticatedUser = await verifyAdminCredentials(id, pass);
    
    if (authenticatedUser) {
        const session = { adminId: authenticatedUser.adminId, role: authenticatedUser.role };
        saveAuthSessionToStorage(session);

        if (authenticatedUser.role === 'superadmin') {
            setIsSuperAdmin(true);
            setIsAdmin(false);
        } else {
            setIsAdmin(true);
            setIsSuperAdmin(false);
        }
        setCurrentAdminId(authenticatedUser.adminId);
        return true;
    }

    return false;
  }, []);

  const logout = useCallback(async () => {
    clearAuthSessionInStorage();
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setCurrentAdminId(null);
    router.push('/admin/login');
  }, [router]);

  const addAdmin = useCallback(async (id: string, password: string): Promise<AdminCreationStatus> => {
    const status = await addAdminToDb(id, password);
    if (status === 'SUCCESS') {
      // Refetch admins to get the new one
      const updatedAdmins = await getAdminsFromDb();
      setAdmins(updatedAdmins.filter(a => a.role === 'admin'));
    }
    return status;
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
