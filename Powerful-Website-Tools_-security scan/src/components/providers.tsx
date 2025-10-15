"use client";

import * as React from "react";
import { ComparisonProvider } from "@/contexts/comparison-context";
import { CollectionsProvider } from "@/contexts/collections-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { ComparisonBar } from "@/components/comparison-bar";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ComparisonProvider>
        <CollectionsProvider>
          {children}
          <ComparisonBar />
          <Toaster />
        </CollectionsProvider>
      </ComparisonProvider>
    </ThemeProvider>
  );
}