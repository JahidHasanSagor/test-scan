"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Eye, Sparkles, Users } from "lucide-react";

type TrendingStat = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

const defaultStats: TrendingStat[] = [
  { id: "1", icon: Eye, label: "Tools viewed today", value: "2,847" },
  { id: "2", icon: Sparkles, label: "New submissions this week", value: "23" },
  { id: "3", icon: Users, label: "Active users now", value: "342" },
  { id: "4", icon: TrendingUp, label: "Trending: AI Tools", value: "+156%" },
];

export function TrendingTicker({ stats = defaultStats, interval = 4000 }: { stats?: TrendingStat[]; interval?: number }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (stats.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, interval);
    return () => clearInterval(timer);
  }, [stats.length, interval]);

  if (stats.length === 0) return null;

  const currentStat = stats[currentIndex];
  const Icon = currentStat.icon;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-chart-5/10 via-chart-3/10 to-chart-2/10 border border-border/50">
      <TrendingUp className="h-3.5 w-3.5 text-chart-3 animate-pulse" />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStat.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 min-w-0"
        >
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentStat.label}:
          </span>
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {currentStat.value}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}