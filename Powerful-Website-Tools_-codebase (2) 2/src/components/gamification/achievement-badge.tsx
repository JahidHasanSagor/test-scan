"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Sparkles, 
  Star, 
  Zap, 
  Target,
  Award,
  Crown,
  Flame,
  Heart,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AchievementType = 
  | "first_save"
  | "first_submit"
  | "power_contributor"
  | "community_favorite"
  | "streak_master"
  | "early_adopter"
  | "explorer"
  | "curator"
  | "influencer"
  | "legend";

export interface AchievementBadgeProps {
  type: AchievementType;
  unlocked?: boolean;
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
  className?: string;
}

const achievementConfig: Record<
  AchievementType,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  first_save: {
    icon: Heart,
    label: "First Save",
    description: "Saved your first tool",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  first_submit: {
    icon: Sparkles,
    label: "First Submit",
    description: "Submitted your first tool",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  power_contributor: {
    icon: Zap,
    label: "Power Contributor",
    description: "Submitted 10+ tools",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  community_favorite: {
    icon: Star,
    label: "Community Favorite",
    description: "Your tools have 100+ views",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  streak_master: {
    icon: Flame,
    label: "Streak Master",
    description: "7-day active streak",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  early_adopter: {
    icon: Crown,
    label: "Early Adopter",
    description: "Joined in the first month",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  explorer: {
    icon: Target,
    label: "Explorer",
    description: "Saved 25+ tools",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  curator: {
    icon: Award,
    label: "Curator",
    description: "Saved 50+ tools",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  influencer: {
    icon: TrendingUp,
    label: "Influencer",
    description: "Your tools have 1000+ views",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  legend: {
    icon: Trophy,
    label: "Legend",
    description: "Achieved all milestones",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
};

export function AchievementBadge({
  type,
  unlocked = false,
  size = "md",
  showAnimation = true,
  className,
}: AchievementBadgeProps) {
  const config = achievementConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <motion.div
      initial={showAnimation && unlocked ? { scale: 0, rotate: -180 } : false}
      animate={showAnimation && unlocked ? { scale: 1, rotate: 0 } : {}}
      transition={{ type: "spring", duration: 0.6 }}
      className={cn("group relative", className)}
      title={`${config.label} - ${config.description}`}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 transition-all",
          sizeClasses[size],
          unlocked
            ? `${config.bgColor} ${config.color} border-current`
            : "bg-muted/50 text-muted-foreground border-muted"
        )}
      >
        <Icon className={iconSizes[size]} />
        
        {unlocked && showAnimation && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 2] }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{
              background: `radial-gradient(circle, currentColor 0%, transparent 70%)`,
            }}
          />
        )}
      </div>
      
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-0.5 w-full rotate-45 bg-muted-foreground/30" />
        </div>
      )}
    </motion.div>
  );
}

export function AchievementList({
  achievements,
  className,
}: {
  achievements: Array<{ type: AchievementType; unlocked: boolean }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {achievements.map((achievement) => (
        <div key={achievement.type} className="relative group">
          <AchievementBadge
            type={achievement.type}
            unlocked={achievement.unlocked}
            size="md"
            showAnimation={false}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
              <p className="font-semibold">{achievementConfig[achievement.type].label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {achievementConfig[achievement.type].description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}