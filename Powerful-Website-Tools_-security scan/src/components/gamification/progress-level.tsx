"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserLevel = 
  | "Newbie" 
  | "Explorer" 
  | "Contributor" 
  | "Expert" 
  | "Master" 
  | "Legend";

export interface ProgressLevelProps {
  currentLevel: UserLevel;
  currentXP: number;
  nextLevelXP: number;
  className?: string;
  showAnimation?: boolean;
}

const levelConfig: Record<UserLevel, { color: string; minXP: number }> = {
  Newbie: { color: "text-gray-500", minXP: 0 },
  Explorer: { color: "text-blue-500", minXP: 100 },
  Contributor: { color: "text-green-500", minXP: 500 },
  Expert: { color: "text-purple-500", minXP: 1500 },
  Master: { color: "text-orange-500", minXP: 3000 },
  Legend: { color: "text-amber-500", minXP: 5000 },
};

const levelOrder: UserLevel[] = [
  "Newbie",
  "Explorer",
  "Contributor",
  "Expert",
  "Master",
  "Legend",
];

export function ProgressLevel({
  currentLevel,
  currentXP,
  nextLevelXP,
  className,
  showAnimation = true,
}: ProgressLevelProps) {
  const config = levelConfig[currentLevel];
  const currentLevelIndex = levelOrder.indexOf(currentLevel);
  const nextLevel = levelOrder[currentLevelIndex + 1];
  const progress = (currentXP / nextLevelXP) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            initial={showAnimation ? { scale: 0, rotate: -180 } : false}
            animate={showAnimation ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Badge
              variant="secondary"
              className={cn(
                "gap-1 px-3 py-1.5 text-sm font-semibold",
                config.color
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {currentLevel}
            </Badge>
          </motion.div>
          {nextLevel && (
            <span className="text-xs text-muted-foreground">
              → {nextLevel}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {currentXP.toLocaleString("en-US")} XP
          </div>
          {nextLevel && (
            <div className="text-xs text-muted-foreground">
              {(nextLevelXP - currentXP).toLocaleString("en-US")} to {nextLevel}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <Progress value={progress} className="h-2.5" />
        {showAnimation && (
          <motion.div
            className="absolute inset-0 h-2.5 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{Math.round(progress)}% complete</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Keep going!
        </span>
      </div>
    </div>
  );
}

export function calculateUserLevel(xp: number): UserLevel {
  if (xp >= 5000) return "Legend";
  if (xp >= 3000) return "Master";
  if (xp >= 1500) return "Expert";
  if (xp >= 500) return "Contributor";
  if (xp >= 100) return "Explorer";
  return "Newbie";
}

export function calculateNextLevelXP(currentLevel: UserLevel): number {
  const currentIndex = levelOrder.indexOf(currentLevel);
  const nextLevel = levelOrder[currentIndex + 1];
  if (!nextLevel) return levelConfig[currentLevel].minXP;
  return levelConfig[nextLevel].minXP;
}

export function calculateXP(stats: {
  saved_count: number;
  submitted_count: number;
  total_views: number;
}): number {
  // XP calculation formula:
  // - 10 XP per saved tool
  // - 50 XP per submitted tool
  // - 1 XP per view
  return (
    stats.saved_count * 10 +
    stats.submitted_count * 50 +
    stats.total_views * 1
  );
}