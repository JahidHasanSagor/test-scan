"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Clock,
  TrendingUp,
  Hash,
  Play,
  Pause,
  Crown,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronUp,
  Eye,
  Heart,
  Star,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import { useState, useRef } from "react";
import { truncateWords } from "@/lib/text-utils";

type Pricing = "free" | "paid" | "freemium";
type ToolType = "Web App" | "Browser Extension" | "API" | "Mobile App";
type Category =
  | "Design"
  | "Development"
  | "Marketing"
  | "Productivity"
  | "AI"
  | "Analytics";

export type DynamicTool = {
  id: string;
  title: string;
  description: string;
  category: Category;
  pricing: Pricing;
  type: ToolType;
  rating: number;
  reviews: any[];
  features: string[];
  website: string;
  image: string;
  popularity: number;
  createdAt: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  videoUrl?: string;
  extendedDescription?: string;
  premiumTags?: string[];
  ctaText?: string;
  votes?: number;
  views?: number;
};

const PRICING_COLORS: Record<Pricing, string> = {
  free: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  paid: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  freemium: "bg-chart-3/10 text-chart-3 border-chart-3/30",
};

// Colorful feature tag styles - cycles through vibrant colors
const FEATURE_COLORS = [
  "bg-chart-5/15 text-chart-5 border-chart-5/30 hover:bg-chart-5/25", // purple
  "bg-chart-3/15 text-chart-3 border-chart-3/30 hover:bg-chart-3/25", // blue
  "bg-chart-2/15 text-chart-2 border-chart-2/30 hover:bg-chart-2/25", // green
  "bg-chart-4/15 text-chart-4 border-chart-4/30 hover:bg-chart-4/25", // amber
];

type DynamicToolCardProps = {
  tool: DynamicTool;
  index: number;
  onSave?: (toolId: string) => void;
  isSaved?: boolean;
  onVote?: (toolId: string) => void;
  isVoted?: boolean;
};

export function DynamicToolCard({ 
  tool, 
  index, 
  onSave, 
  isSaved = false,
  onVote,
  isVoted = false 
}: DynamicToolCardProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localSaved, setLocalSaved] = useState(isSaved);
  const [localVoted, setLocalVoted] = useState(isVoted);
  const [localVotes, setLocalVotes] = useState(tool.votes || 0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Image src sanitizer to prevent unconfigured hosts (e.g., Unsplash)
  const IMG_PLACEHOLDER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
  const safeImageSrc = React.useMemo(() => {
    try {
      const src = (tool.image || "").trim();
      if (!src) return IMG_PLACEHOLDER;
      if (src.startsWith("data:") || src.startsWith("/")) return src;
      const url = new URL(src);
      const host = url.hostname.toLowerCase();
      // Block unsplash and any unknown hosts not in our allowlist
      const allowlist = [
        "api.dicebear.com",
        "localhost",
        "127.0.0.1",
        // supabase projects
        "slelguoygbfzlpylpxfs.supabase.co",
      ];
      if (host.endsWith("images.unsplash.com")) return IMG_PLACEHOLDER;
      if (!allowlist.some((h) => host === h || host.endsWith("." + h))) {
        return IMG_PLACEHOLDER;
      }
      return src;
    } catch {
      return IMG_PLACEHOLDER;
    }
  }, [tool.image]);

  // Extract publisher from website URL
  const getPublisher = () => {
    try {
      const url = new URL(tool.website);
      const hostname = url.hostname.replace('www.', '');
      return hostname.split('.')[0];
    } catch {
      return "Unknown";
    }
  };

  // Generate star rating display
  const renderStars = () => {
    const rating = tool.rating || 4.5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-current" />
        ))}
        {hasHalfStar && <Star className="h-3.5 w-3.5 fill-current opacity-50" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-3.5 w-3.5" />
        ))}
      </div>
    );
  };

  // Format vote count
  const formatVotes = (votes: number) => {
    if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1)}K`;
    }
    return votes.toString();
  };

  // Truncate descriptions
  const displayDescription = truncateWords(tool.description, 7);
  
  // Get "Best For" tags (use first 3 features)
  const bestForTags = tool.features.slice(0, 3);

  // Video controls
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalSaved(!localSaved);
    onSave?.(tool.id);
  };

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVotedState = !localVoted;
    setLocalVoted(newVotedState);
    setLocalVotes(prev => newVotedState ? prev + 1 : prev - 1);
    onVote?.(tool.id);
  };

  const handleVisitWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(tool.website, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card
        className="group overflow-hidden border-border transition-all duration-300 cursor-pointer h-full flex flex-col hover:border-primary/30 hover:shadow-lg"
        onClick={() => router.push(`/tool/${tool.id}`)}
      >
        <div className="p-4 space-y-3 flex-1">
          {/* Video Section - Premium Only */}
          {tool.isPremium && tool.videoUrl && (
            <div className="relative -mx-4 -mt-4 mb-4">
              <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={tool.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-foreground" />
                  ) : (
                    <Play className="h-6 w-6 text-foreground ml-0.5" />
                  )}
                </button>

                {/* Volume & Fullscreen Controls */}
                <div className="absolute bottom-2 right-2 flex gap-2 z-10">
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-foreground" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-foreground" />
                    )}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
                    aria-label="Fullscreen"
                  >
                    <Maximize className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header - Logo, Title, Publisher, Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Logo - 30% larger */}
              <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 border-border">
                <Image
                  src={safeImageSrc}
                  alt={tool.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={safeImageSrc.startsWith("data:")}
                />
              </div>

              {/* Title & Publisher */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight hover:text-primary transition-colors truncate">
                  {tool.title}
                </h3>
                <p className="text-sm text-muted-foreground capitalize truncate">
                  {getPublisher()}
                </p>
              </div>
            </div>

            {/* Actions - Upvote & Save */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Upvote Button */}
              <motion.button
                onClick={handleVote}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-2.5 py-1 transition-all text-xs font-medium h-8",
                  localVoted
                    ? "border-chart-2 bg-chart-2/10 text-chart-2"
                    : "border-border bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                aria-label={localVoted ? "Remove vote" : "Upvote"}
              >
                <ChevronUp className={cn("h-3.5 w-3.5", localVoted && "fill-current")} />
                <span className="font-bold">{formatVotes(localVotes)}</span>
              </motion.button>

              {/* Save Button */}
              <Button
                size="icon"
                variant="secondary"
                onClick={handleSave}
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  localSaved && "bg-primary/20 hover:bg-primary/30"
                )}
                title={localSaved ? "Remove from saved" : "Save for later"}
              >
                {localSaved ? (
                  <Heart className="h-4 w-4 text-primary fill-current" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Pricing Badge */}
          <div className="flex">
            <Badge
              variant="outline"
              className={cn("capitalize text-xs font-medium", PRICING_COLORS[tool.pricing])}
            >
              {tool.pricing === "free" ? "Free" : tool.pricing === "paid" ? "Paid" : "Freemium"}
            </Badge>
          </div>

          {/* Short Description */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {displayDescription}
          </p>

          {/* Tags from Knowledge Base */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="text-xs font-medium bg-primary/15 text-primary border-primary/30"
            >
              {tool.category}
            </Badge>
            {tool.features.slice(0, 3).map((feature, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className={cn(
                  "text-xs font-medium transition-colors",
                  FEATURE_COLORS[i % FEATURE_COLORS.length]
                )}
              >
                {feature}
              </Badge>
            ))}
          </div>

          {/* Stats Row - Rating, Reviews, Type Badge */}
          <div className="flex items-center gap-4">
            {/* Star Rating */}
            {renderStars()}
            
            {/* Review Count */}
            <span className="text-xs text-muted-foreground">
              {tool.reviews?.length || 0} reviews
            </span>

            {/* Type Badge */}
            <Badge variant="outline" className="text-xs font-medium bg-secondary">
              {tool.type}
            </Badge>
          </div>

          {/* Best For Section */}
          {bestForTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Best For:</p>
              <div className="flex flex-wrap gap-1.5">
                {bestForTags.map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="text-xs font-medium bg-muted/50 text-foreground border-border"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Extended Premium Description - Premium Only */}
          {tool.isPremium && tool.extendedDescription && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-2">Why This Tool Stands Out</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tool.extendedDescription}
              </p>
            </div>
          )}

          {/* Premium-Only Tags */}
          {tool.isPremium && tool.premiumTags && tool.premiumTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tool.premiumTags.map((tag, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium transition-colors",
                    FEATURE_COLORS[i % FEATURE_COLORS.length]
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
          {/* Left: View Count or Time */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{tool.views?.toLocaleString("en-US") || 0}</span>
          </div>

          {/* Right: CTA Button */}
          <Button
            size="sm"
            onClick={handleVisitWebsite}
            className="shrink-0 gap-1.5 font-medium shadow-sm hover:shadow-md"
          >
            <span>Visit</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}