"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6 space-y-4 animate-pulse", className)}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-muted/50" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted/50 rounded" />
          <div className="h-3 w-1/2 bg-muted/50 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted/50 rounded" />
        <div className="h-3 w-5/6 bg-muted/50 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted/50 rounded-full" />
        <div className="h-6 w-20 bg-muted/50 rounded-full" />
      </div>
    </Card>
  );
}

export function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-muted/50 rounded" />
              <div className="h-8 w-16 bg-muted/50 rounded" />
            </div>
            <div className="h-12 w-12 rounded-lg bg-muted/50" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonToolCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden animate-pulse", className)}>
      <div className="aspect-[16/9] bg-muted/50" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted/50 rounded" />
          <div className="h-3 w-full bg-muted/50 rounded" />
          <div className="h-3 w-5/6 bg-muted/50 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted/50 rounded-full" />
          <div className="h-6 w-20 bg-muted/50 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-muted/50 rounded-full" />
          <div className="h-9 w-20 bg-muted/50 rounded-full" />
        </div>
      </div>
    </Card>
  );
}