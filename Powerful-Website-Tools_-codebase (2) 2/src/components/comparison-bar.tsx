"use client";

import * as React from "react";
import Image from "next/image";
import { useComparison } from "@/contexts/comparison-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComparisonModal } from "@/components/comparison-modal";
import { X, GitCompare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ComparisonBar() {
  const { comparedTools, removeFromComparison, clearComparison, maxTools } = useComparison();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  if (comparedTools.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-2xl"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Tool previews */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold whitespace-nowrap">
                    Compare Tools
                  </span>
                  <Badge variant="secondary" className="ml-1">
                    {comparedTools.length}/{maxTools}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
                  {comparedTools.map((tool) => (
                    <motion.div
                      key={tool.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="group relative flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 min-w-0 shrink-0"
                    >
                      <div className="relative h-8 w-8 shrink-0">
                        <Image
                          src={tool.image}
                          alt={tool.title}
                          fill
                          className="rounded object-cover"
                          sizes="32px"
                        />
                      </div>
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {tool.title}
                      </span>
                      <button
                        onClick={() => removeFromComparison(tool.id)}
                        className="shrink-0 rounded-full p-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        aria-label={`Remove ${tool.title}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearComparison}
                  className="hidden sm:inline-flex"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  disabled={comparedTools.length < 2}
                  className="gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare
                  <span className="hidden sm:inline">
                    ({comparedTools.length})
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <ComparisonModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}