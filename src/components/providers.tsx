"use client";

import { ItemProvider } from "@/context/item-context";
import { BagProvider } from "@/context/bag-context";
import { AdminAuthProvider } from "@/context/admin-auth-context";
import { OrderProvider } from "@/context/order-context";
import { VisitorProvider } from "@/context/visitor-context";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ItemProvider>
        <VisitorProvider>
          <BagProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
          </BagProvider>
        </VisitorProvider>
      </ItemProvider>
    </AdminAuthProvider>
  );
}
