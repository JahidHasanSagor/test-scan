"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Gem, BookOpen, Star, FolderOpenDot, ChevronLeft, ChevronRight, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlogPreview } from "@/components/blog-preview";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TabId = "tool-week" | "popular" | "community-gems" | "blog";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const tabs: Tab[] = [
  {
    id: "tool-week",
    label: "Tool of the Week",
    icon: Sparkles,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10 hover:bg-chart-5/20",
  },
  {
    id: "popular",
    label: "Most Popular This Month",
    icon: TrendingUp,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10 hover:bg-chart-3/20",
  },
  {
    id: "community-gems",
    label: "Community Gems",
    icon: Gem,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10 hover:bg-chart-2/20",
  },
  {
    id: "blog",
    label: "From the Blog",
    icon: BookOpen,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10 hover:bg-chart-4/20",
  },
];

interface FeaturedTabsProps {
  onAddToCollection?: (tool: { id: string; title: string; url: string }) => void;
}

type ToolItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  rating: number;
  ratingsCount?: number;
  categories: string[];
  ctaLabel?: string;
};

type CommunityGem = {
  id: string;
  title: string;
  description: string;
  url: string;
  votes: number;
  category: string;
  submittedBy: string;
  submittedDate: string;
};

const mockCommunityGems: CommunityGem[] = [
  {
    id: "1",
    title: "Notion AI",
    description: "AI-powered workspace for notes, docs, and wikis with smart suggestions",
    url: "https://notion.so",
    votes: 342,
    category: "Productivity",
    submittedBy: "Sarah Chen",
    submittedDate: "2 days ago"
  },
  {
    id: "2",
    title: "Midjourney",
    description: "Create stunning AI-generated artwork from text descriptions",
    url: "https://midjourney.com",
    votes: 287,
    category: "Design",
    submittedBy: "Alex Kim",
    submittedDate: "5 days ago"
  },
  {
    id: "3",
    title: "Claude AI",
    description: "Advanced conversational AI assistant for research and writing",
    url: "https://claude.ai",
    votes: 256,
    category: "AI Assistant",
    submittedBy: "Maya Patel",
    submittedDate: "1 week ago"
  },
  {
    id: "4",
    title: "Runway ML",
    description: "AI-powered video editing and content generation platform",
    url: "https://runwayml.com",
    votes: 198,
    category: "Video",
    submittedBy: "Jordan Lee",
    submittedDate: "3 days ago"
  }
];

function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  const full = Math.floor(rounded);
  const half = rounded - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-chart-4 text-chart-4" />
      ))}
      {half && (
        <div className="relative h-4 w-4">
          <Star className="absolute inset-0 h-4 w-4 text-chart-4" />
          <Star className="absolute inset-0 h-4 w-4 fill-chart-4 text-chart-4 [clip-path:inset(0_50%_0_0)]" />
        </div>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
      ))}
    </div>
  );
}

function ToolCard({ tool, layout = "default", onAdd, onAddToCollection }: { tool: ToolItem; layout?: "default" | "compact" | "hero" | "carousel"; onAdd?: (tool: ToolItem) => void; onAddToCollection?: (tool: ToolItem) => void }) {
  // Image src sanitizer to prevent unconfigured hosts (e.g., Unsplash)
  const IMG_PLACEHOLDER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
  const safeImageSrc = React.useMemo(() => {
    try {
      const src = (tool.image || "").trim();
      if (!src) return IMG_PLACEHOLDER;
      if (src.startsWith("data:") || src.startsWith("/")) return src;
      const url = new URL(src);
      const host = url.hostname.toLowerCase();
      const allowlist = [
        "api.dicebear.com",
        "localhost",
        "127.0.0.1",
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

  if (layout === "hero") {
    return (
      <Card className="group relative overflow-hidden rounded-[var(--radius)] border-border bg-gradient-to-br from-chart-5/5 via-card to-chart-3/5 transition-all duration-300 hover:shadow-xl">
        <div className="relative flex flex-col md:flex-row min-w-0 items-stretch gap-6 p-6">
          <div className="pointer-events-none absolute -inset-12 -z-10 rounded-[2rem] bg-gradient-to-br from-chart-5/20 via-transparent to-chart-3/20 blur-3xl" />
          
          <div className="self-start relative h-16 w-16">
            <Image
              src={safeImageSrc}
              alt={`${tool.title} logo`}
              fill
              className="rounded-xl border-2 border-border object-cover bg-secondary shadow-lg"
              sizes="64px"
              unoptimized={safeImageSrc.startsWith("data:")}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-3">
              <h3 className="min-w-0 font-display text-2xl font-bold">{tool.title}</h3>
              <div className="flex shrink-0 items-center gap-2">
                <RatingStars rating={tool.rating} />
                <span className="text-sm font-medium">{tool.rating.toFixed(1)}</span>
                {tool.ratingsCount && (
                  <span className="text-sm text-muted-foreground">({Intl.NumberFormat().format(tool.ratingsCount)})</span>
                )}
              </div>
            </div>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">{tool.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {tool.categories.slice(0, 4).map((c) => (
                <Badge key={c} variant="secondary" className="bg-secondary/90 text-foreground">
                  {c}
                </Badge>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-lg"
              >
                {tool.ctaLabel ?? "Visit"}
              </a>
              <Button
                variant="outline"
                onClick={() => onAdd?.(tool)}
                className="gap-2 rounded-full"
              >
                <FolderOpenDot className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (layout === "carousel") {
    return (
      <Card className="group h-full flex-shrink-0 w-[280px] sm:w-[320px] overflow-hidden rounded-[var(--radius)] border-border bg-card transition-shadow hover:shadow-lg">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src={safeImageSrc}
                alt={`${tool.title} logo`}
                fill
                className="rounded-lg border border-border object-cover bg-secondary"
                sizes="48px"
                unoptimized={safeImageSrc.startsWith("data:")}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-semibold truncate">{tool.title}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <RatingStars rating={tool.rating} />
                <span className="text-xs font-medium">{tool.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {tool.categories.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary" className="text-xs">
                {c}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-2 p-4 pt-0">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90"
          >
            {tool.ctaLabel ?? "Visit"}
          </a>
          <Button variant="ghost" size="sm" onClick={() => onAdd?.(tool)} className="gap-2 rounded-full px-2">
            <FolderOpenDot className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (layout === "compact") {
    return (
      <Card className="group overflow-hidden rounded-[var(--radius)] border-border bg-card transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src={safeImageSrc}
                alt={`${tool.title} logo`}
                fill
                className="rounded-lg border border-border object-cover bg-secondary"
                sizes="48px"
                unoptimized={safeImageSrc.startsWith("data:")}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-semibold">{tool.title}</h3>
                <div className="flex items-center gap-1">
                  <RatingStars rating={tool.rating} />
                  <span className="text-xs text-muted-foreground">{tool.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {tool.categories.slice(0, 3).map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2 p-5 pt-0">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90"
          >
            {tool.ctaLabel ?? "Visit"}
          </a>
          <Button variant="ghost" size="sm" onClick={() => onAdd?.(tool)} className="gap-2 rounded-full">
            <FolderOpenDot className="h-4 w-4" />
            Save
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden rounded-[var(--radius)] border-border bg-card transition-shadow hover:shadow-lg">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14">
            <Image
              src={safeImageSrc}
              alt={`${tool.title} logo`}
              fill
              className="rounded-lg border border-border object-cover bg-secondary"
              sizes="56px"
              unoptimized={safeImageSrc.startsWith("data:")}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">{tool.title}</h3>
          <div className="flex items-center gap-1">
            <RatingStars rating={tool.rating} />
            <span className="text-sm font-medium">{tool.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tool.categories.slice(0, 3).map((c) => (
            <Badge key={c} variant="secondary">
              {c}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 p-5 pt-0">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90"
        >
          {tool.ctaLabel ?? "Visit"}
        </a>
        <Button variant="outline" onClick={() => onAdd?.(tool)} className="gap-2 rounded-full">
          <FolderOpenDot className="h-4 w-4" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}

function CommunityGemsTab() {
  const [gems, setGems] = React.useState<CommunityGem[]>(mockCommunityGems);
  const [votedIds, setVotedIds] = React.useState<Set<string>>(new Set());

  const handleVote = React.useCallback((id: string) => {
    if (votedIds.has(id)) {
      setGems((prev) => prev.map((g) => g.id === id ? { ...g, votes: g.votes - 1 } : g));
      setVotedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setGems((prev) => prev.map((g) => g.id === id ? { ...g, votes: g.votes + 1 } : g));
      setVotedIds((prev) => new Set(prev).add(id));
    }
  }, [votedIds]);

  const sortedGems = React.useMemo(() => {
    return [...gems].sort((a, b) => b.votes - a.votes);
  }, [gems]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {sortedGems.map((gem, index) => {
          const isVoted = votedIds.has(gem.id);
          return (
            <motion.div
              key={gem.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all"
            >
              {index < 3 && (
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      index === 1 ? 'bg-secondary/80 text-foreground' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    #{index + 1}
                  </Badge>
                </div>
              )}

              <motion.button
                onClick={() => handleVote(gem.id)}
                whileTap={{ scale: 0.95 }}
                className={`mb-3 flex flex-col items-center gap-1 rounded-md border px-3 py-2 transition-all ${
                  isVoted
                    ? 'border-chart-2 bg-chart-2/10 text-chart-2'
                    : 'border-border bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                aria-label={isVoted ? 'Remove vote' : 'Upvote'}
              >
                <ChevronUp className={`h-5 w-5 ${isVoted ? 'fill-current' : ''}`} />
                <span className="text-sm font-bold">{gem.votes}</span>
              </motion.button>

              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  {gem.category}
                </Badge>
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                  {gem.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {gem.description}
                </p>
                <div className="pt-2 text-xs text-muted-foreground">
                  By {gem.submittedBy} • {gem.submittedDate}
                </div>
              </div>

              <a
                href={gem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Visit tool
                <ExternalLink className="h-3 w-3" />
              </a>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function FeaturedTabs({ onAddToCollection }: FeaturedTabsProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>("tool-week");
  const [toolOfTheWeek, setToolOfTheWeek] = React.useState<any>(null);
  const [featuredTools, setFeaturedTools] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Fetch Tool of the Week and Featured tools
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        
        // Fetch Tool of the Week
        const toolOfWeekResponse = await fetch("/api/tools/tool-of-week", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (toolOfWeekResponse.ok) {
          const toolData = await toolOfWeekResponse.json();
          setToolOfTheWeek(toolData);
        }

        // Fetch Featured tools for the carousel
        const featuredResponse = await fetch("/api/tools/featured?limit=100", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (featuredResponse.ok) {
          const data = await featuredResponse.json();
          setFeaturedTools(data);
        }
      } catch (error) {
        console.error("Error fetching featured data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform Tool of the Week data
  const toolOfWeekData = toolOfTheWeek
    ? {
        id: toolOfTheWeek.id.toString(),
        title: toolOfTheWeek.title,
        description: toolOfTheWeek.description,
        url: toolOfTheWeek.url,
        image: toolOfTheWeek.image || "",
        rating: 4.7,
        ratingsCount: toolOfTheWeek.popularity || 100,
        categories: [toolOfTheWeek.category, toolOfTheWeek.type].filter(Boolean),
        ctaLabel: "Try for Free",
      }
    : null;

  const popularTools = featuredTools.slice(0, 8).map((t: any) => ({
    id: t.id.toString(),
    title: t.title,
    description: t.description,
    url: t.url,
    image: t.image || "",
    rating: 4.6,
    ratingsCount: t.popularity || 100,
    categories: [t.category].filter(Boolean),
    ctaLabel: "Explore",
  }));

  const scroll = (direction: "left" | "right", ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const scrollAmount = 340;
      const currentScroll = ref.current.scrollLeft;
      const targetScroll = direction === "left" 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      ref.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? `${tab.bgColor} ${tab.color} shadow-sm`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? tab.color : "")} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl border-2 border-current opacity-20"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {activeTab === "tool-week" && (
              toolOfWeekData ? (
                <ToolCard tool={toolOfWeekData} onAdd={onAddToCollection} layout="hero" />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium">No Tool of the Week set yet</p>
                  <p className="text-sm">Check back soon for our featured pick!</p>
                </div>
              )
            )}

            {activeTab === "popular" && (
              popularTools.length > 0 ? (
                <div className="relative">
                  <div 
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {popularTools.map((tool: ToolItem) => (
                      <ToolCard key={tool.id} tool={tool} onAdd={onAddToCollection} layout="carousel" />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => scroll("left", scrollContainerRef)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scroll("right", scrollContainerRef)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    ← Swipe to explore more →
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                  No popular tools available
                </div>
              )
            )}

            {activeTab === "community-gems" && <CommunityGemsTab />}

            {activeTab === "blog" && <BlogPreview />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}