"use client";

import { ItemProvider } from "@/context/item-context";
import { BagProvider } from "@/context/bag-context";
import { ThemeProvider } from "@/context/theme-context";
import { AdminAuthProvider } from "@/context/admin-auth-context";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ThemeProvider>
        <ItemProvider>
          <BagProvider>
            {children}
          </BagProvider>
        </ItemProvider>
      </ThemeProvider>
    </AdminAuthProvider>
  );
}
