"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface EmptyStateProps {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("p-12 text-center", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        {Icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1, duration: 0.6 }}
            className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/50"
          >
            <Icon className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        )}
        
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
        
        {action && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Button variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
}