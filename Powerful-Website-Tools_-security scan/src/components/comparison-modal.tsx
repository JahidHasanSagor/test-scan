"use client";

import * as React from "react";
import Image from "next/image";
import { useComparison } from "@/contexts/comparison-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ExternalLink, Star, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComparisonModal({ open, onOpenChange }: ComparisonModalProps) {
  const { comparedTools, removeFromComparison, clearComparison } = useComparison();

  if (comparedTools.length === 0) {
    return null;
  }

  const comparisonRows = [
    {
      label: "Tool",
      key: "tool",
      render: (tool: any) => (
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="relative h-16 w-16">
            <Image
              src={tool.image}
              alt={tool.title}
              fill
              className="rounded-lg object-cover border border-border"
              sizes="64px"
            />
          </div>
          <h3 className="text-center font-semibold text-sm">{tool.title}</h3>
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Visit
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      label: "Description",
      key: "description",
      render: (tool: any) => (
        <p className="text-sm text-muted-foreground p-4">{tool.description}</p>
      ),
    },
    {
      label: "Category",
      key: "category",
      render: (tool: any) => (
        <div className="p-4">
          <Badge variant="secondary">{tool.category}</Badge>
        </div>
      ),
    },
    {
      label: "Pricing",
      key: "pricing",
      render: (tool: any) => (
        <div className="p-4">
          <Badge variant="outline" className="capitalize">
            {tool.pricing}
          </Badge>
        </div>
      ),
    },
    {
      label: "Type",
      key: "type",
      render: (tool: any) => (
        <div className="p-4">
          <Badge variant="secondary">{tool.type}</Badge>
        </div>
      ),
    },
    {
      label: "Rating",
      key: "rating",
      render: (tool: any) => (
        <div className="flex items-center gap-2 p-4">
          <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
          <span className="text-sm font-medium">
            {tool.rating ? tool.rating.toFixed(1) : "N/A"}
          </span>
        </div>
      ),
    },
    {
      label: "Features",
      key: "features",
      render: (tool: any) => (
        <div className="p-4 space-y-2">
          {tool.features && tool.features.length > 0 ? (
            tool.features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-chart-2 shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Minus className="h-4 w-4" />
              <span className="text-sm">No features listed</span>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Popularity",
      key: "popularity",
      render: (tool: any) => (
        <div className="p-4">
          <span className="text-sm font-medium">
            {tool.popularity ? `${tool.popularity} views` : "N/A"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Compare Tools</DialogTitle>
              <DialogDescription>
                Side-by-side comparison of {comparedTools.length} tool
                {comparedTools.length !== 1 ? "s" : ""}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={clearComparison}>
              Clear All
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-background">
                <tr>
                  <th className="w-48 p-4 text-left font-semibold text-sm border-b border-r border-border bg-secondary/50">
                    Property
                  </th>
                  {comparedTools.map((tool) => (
                    <th
                      key={tool.id}
                      className="min-w-[250px] p-4 text-center font-semibold text-sm border-b border-r border-border bg-card relative"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={() => removeFromComparison(tool.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {tool.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, rowIdx) => (
                  <tr key={row.key}>
                    <td
                      className={cn(
                        "w-48 p-4 font-medium text-sm border-b border-r border-border bg-secondary/50",
                        rowIdx === comparisonRows.length - 1 && "border-b-0"
                      )}
                    >
                      {row.label}
                    </td>
                    {comparedTools.map((tool, toolIdx) => (
                      <td
                        key={tool.id}
                        className={cn(
                          "min-w-[250px] border-b border-r border-border bg-card align-top",
                          rowIdx === comparisonRows.length - 1 && "border-b-0",
                          toolIdx === comparedTools.length - 1 && "border-r-0"
                        )}
                      >
                        {row.render(tool)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}