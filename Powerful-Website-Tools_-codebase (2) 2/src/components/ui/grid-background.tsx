"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function GridBackground({ className, children }: GridBackgroundProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden="true" />
      
      {/* Gradient overlay for fade effect */}
      <div 
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}