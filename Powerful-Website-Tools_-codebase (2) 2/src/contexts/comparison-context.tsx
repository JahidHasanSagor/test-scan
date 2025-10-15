"use client";

import * as React from "react";
import { toast } from "sonner";

type Tool = {
  id: string;
  title: string;
  description: string;
  category: string;
  pricing: string;
  type: string;
  rating?: number;
  features: string[];
  website: string;
  image: string;
  popularity?: number;
};

type ComparisonContextType = {
  comparedTools: Tool[];
  addToComparison: (tool: Tool) => void;
  removeFromComparison: (toolId: string) => void;
  clearComparison: () => void;
  isInComparison: (toolId: string) => boolean;
  maxTools: number;
};

const ComparisonContext = React.createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [comparedTools, setComparedTools] = React.useState<Tool[]>([]);
  const maxTools = 4; // Maximum tools to compare

  const addToComparison = React.useCallback(
    (tool: Tool) => {
      if (comparedTools.length >= maxTools) {
        toast.error(`You can only compare up to ${maxTools} tools at once`);
        return;
      }

      if (comparedTools.some((t) => t.id === tool.id)) {
        toast.info(`${tool.title} is already in comparison`);
        return;
      }

      setComparedTools((prev) => [...prev, tool]);
      toast.success(`${tool.title} added to comparison`);
    },
    [comparedTools, maxTools]
  );

  const removeFromComparison = React.useCallback((toolId: string) => {
    setComparedTools((prev) => {
      const removed = prev.find((t) => t.id === toolId);
      if (removed) {
        toast.info(`${removed.title} removed from comparison`);
      }
      return prev.filter((t) => t.id !== toolId);
    });
  }, []);

  const clearComparison = React.useCallback(() => {
    setComparedTools([]);
    toast.info("Comparison cleared");
  }, []);

  const isInComparison = React.useCallback(
    (toolId: string) => {
      return comparedTools.some((t) => t.id === toolId);
    },
    [comparedTools]
  );

  const value = React.useMemo(
    () => ({
      comparedTools,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison,
      maxTools,
    }),
    [comparedTools, addToComparison, removeFromComparison, clearComparison, isInComparison, maxTools]
  );

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison() {
  const context = React.useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within ComparisonProvider");
  }
  return context;
}