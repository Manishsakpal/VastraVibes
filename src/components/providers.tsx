"use client";

import { ItemProvider } from "@/context/item-context";
import { BagProvider } from "@/context/bag-context";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ItemProvider>
      <BagProvider>
        {children}
      </BagProvider>
    </ItemProvider>
  );
}
