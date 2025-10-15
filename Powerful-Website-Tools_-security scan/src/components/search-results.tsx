"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import type { SearchResult } from "@/lib/search-service";
import { MasonryLayout } from "@/components/masonry-layout";
import { DynamicToolCard, DynamicTool } from "@/components/tool-card-dynamic";
import { useState, useEffect } from "react";

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
}

export function SearchResults({ results, loading }: SearchResultsProps) {
  const [columnCount, setColumnCount] = useState(3);

  // Update column count on window resize
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) {
        setColumnCount(1);
      } else if (window.innerWidth < 1024) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  if (loading) {
    return <LoadingGridSkeleton />;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No tools found matching your search.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <MasonryLayout columnCount={columnCount}>
      {results.map((tool, index) => (
        <DynamicToolCard 
          key={tool.id} 
          tool={tool as DynamicTool} 
          index={index}
        />
      ))}
    </MasonryLayout>
  );
}

function LoadingGridSkeleton() {
  const items = Array.from({ length: 9 });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-border bg-card overflow-hidden"
        >
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 bg-secondary rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-secondary rounded" />
                <div className="h-3 w-full bg-secondary rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-secondary rounded-full" />
              <div className="h-5 w-20 bg-secondary rounded-full" />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <div className="h-3 w-full bg-secondary rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}