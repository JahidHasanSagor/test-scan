"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Send,
  TrendingUp,
  Zap,
  Clock,
  Eye,
  Hash,
  Play,
  Code,
  Bot,
  BarChart3,
  Globe,
  Puzzle,
  Smartphone,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { DynamicToolCard, DynamicTool } from "@/components/tool-card-dynamic";
import { MasonryLayout } from "@/components/masonry-layout";

type Pricing = "free" | "paid" | "freemium";
type ToolType = "Web App" | "Browser Extension" | "API" | "Mobile App";
type Category =
  | "Design"
  | "Development"
  | "Marketing"
  | "Productivity"
  | "AI"
  | "Analytics";

export type Tool = {
  id: string;
  title: string;
  description: string;
  category: Category;
  pricing: Pricing;
  type: ToolType;
  rating: number; // 0-5
  reviews: { id: string; author: string; content: string; createdAt: string; rating: number }[];
  features: string[];
  website: string;
  image: string;
  popularity: number; // higher is more popular
  createdAt: string; // ISO date
  isFeatured?: boolean;
};

export type ToolDirectoryProps = {
  className?: string;
  style?: React.CSSProperties;
  tools?: Tool[];
  pageSize?: number;
  defaultView?: "grid" | "list";
  initialSearch?: string;
  initialType?: string; // Add prop for filtering by type
  showFilters?: boolean; // New prop to control filter sidebar visibility
};

const FALLBACK_TOOLS: Tool[] = [
  {
    id: "1",
    title: "PixelCraft Studio",
    description:
      "A smart design toolkit that accelerates UI creation with AI-powered components.",
    category: "Design",
    pricing: "freemium",
    type: "Web App",
    rating: 4.6,
    reviews: [
      {
        id: "r1",
        author: "Ava",
        content: "Great starting points for wireframes. Exports are clean.",
        createdAt: "2025-05-20",
        rating: 5,
      },
      {
        id: "r2",
        author: "Leo",
        content: "Helpful, though the AI suggestions can be generic.",
        createdAt: "2025-05-25",
        rating: 4,
      },
    ],
    features: ["AI suggestions", "Figma export", "Design tokens"],
    website: "https://example.com/pixelcraft",
    image: "",
    popularity: 985,
    createdAt: "2025-03-05",
    isFeatured: true,
  },
  {
    id: "2",
    title: "CodePulse Monitor",
    description:
      "Lightweight analytics for frontend performance with actionable insights.",
    category: "Analytics",
    pricing: "paid",
    type: "API",
    rating: 4.3,
    reviews: [
      {
        id: "r3",
        author: "Noah",
        content: "Fast to integrate and the dashboard is tidy.",
        createdAt: "2025-04-15",
        rating: 4,
      },
    ],
    features: ["Core Web Vitals", "Custom events", "Alerting"],
    website: "https://example.com/codepulse",
    image: "",
    popularity: 742,
    createdAt: "2025-04-01",
  },
  {
    id: "3",
    title: "FocusFlow",
    description:
      "Minimal productivity app with gentle nudges and deep work sessions.",
    category: "Productivity",
    pricing: "free",
    type: "Mobile App",
    rating: 4.8,
    reviews: [
      {
        id: "r4",
        author: "Maya",
        content: "Exactly the right amount of features. Love the sessions.",
        createdAt: "2025-06-01",
        rating: 5,
      },
    ],
    features: ["Pomodoro", "Session notes", "Daily summaries"],
    website: "https://example.com/focusflow",
    image: "",
    popularity: 1280,
    createdAt: "2025-05-28",
    isFeatured: true,
  },
  {
    id: "4",
    title: "MarketMuse Radar",
    description:
      "Content planning assistant that finds gaps and recommends topics.",
    category: "Marketing",
    pricing: "freemium",
    type: "Web App",
    rating: 4.2,
    reviews: [],
    features: ["Topic clusters", "Competitor compare", "SEO briefs"],
    website: "https://example.com/marketradar",
    image: "",
    popularity: 612,
    createdAt: "2025-02-22",
  },
  {
    id: "5",
    title: "DevDock",
    description:
      "Streamlined API testing with sharable collections and environments.",
    category: "Development",
    pricing: "free",
    type: "Web App",
    rating: 4.5,
    reviews: [{ id: "r5", author: "Kai", content: "Postman-lite done right.", createdAt: "2025-03-09", rating: 5 }],
    features: ["Environments", "Collections", "Mock servers"],
    website: "https://example.com/devdock",
    image: "",
    popularity: 820,
    createdAt: "2025-03-10",
  },
  {
    id: "6",
    title: "Sensei AI",
    description:
      "General-purpose AI assistant that connects to your tools and data.",
    category: "AI",
    pricing: "paid",
    type: "Web App",
    rating: 4.1,
    reviews: [],
    features: ["Tool integrations", "Memory", "Retrieval"],
    website: "https://example.com/sensei",
    image: "",
    popularity: 1502,
    createdAt: "2025-06-05",
    isFeatured: true,
  },
  {
    id: "7",
    title: "ClipperXT",
    description:
      "Browser extension to capture clean screenshots and annotations.",
    category: "Productivity",
    pricing: "freemium",
    type: "Browser Extension",
    rating: 3.9,
    reviews: [],
    features: ["Full page cap", "Blur PII", "Annotations"],
    website: "https://example.com/clipperxt",
    image: "",
    popularity: 430,
    createdAt: "2025-01-29",
  },
  {
    id: "8",
    title: "InsightBoard",
    description:
      "Dashboards with templates for startups and product teams.",
    category: "Analytics",
    pricing: "paid",
    type: "Web App",
    rating: 4.0,
    reviews: [],
    features: ["Templates", "CSV import", "Embeds"],
    website: "https://example.com/insightboard",
    image: "",
    popularity: 390,
    createdAt: "2025-04-20",
  },
  {
    id: "9",
    title: "PromptPad",
    description:
      "Manage AI prompts with versions, tags, and team sharing.",
    category: "AI",
    pricing: "freemium",
    type: "Web App",
    rating: 4.4,
    reviews: [],
    features: ["Versioning", "Tagging", "Team workspace"],
    website: "https://example.com/promptpad",
    image: "",
    popularity: 955,
    createdAt: "2025-06-08",
  },
];

const ALL_CATEGORIES: Category[] = [
  "Design",
  "Development",
  "Marketing",
  "Productivity",
  "AI",
  "Analytics",
];

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  Design: TrendingUp,
  Development: Code,
  Marketing: TrendingUp,
  Productivity: Zap,
  AI: Bot,
  Analytics: BarChart3,
};

const CATEGORY_COLORS: Record<Category, string> = {
  Design: "bg-chart-5/10 text-chart-5 border-chart-5/30",
  Development: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  Marketing: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  Productivity: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  AI: "bg-chart-5/10 text-chart-5 border-chart-5/30",
  Analytics: "bg-chart-1/10 text-chart-1 border-chart-1/30",
};

const ALL_PRICING: Pricing[] = ["free", "paid", "freemium"];

const PRICING_COLORS: Record<Pricing, string> = {
  free: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  paid: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  freemium: "bg-chart-3/10 text-chart-3 border-chart-3/30",
};

const ALL_TYPES: ToolType[] = ["Web App", "Browser Extension", "API", "Mobile App"];

const TYPE_ICONS: Record<ToolType, React.ComponentType<{ className?: string }>> = {
  "Web App": Globe,
  "Browser Extension": Puzzle,
  "API": Code,
  "Mobile App": Smartphone,
};

type SortBy = "popularity" | "newest" | "rating";
type ViewMode = "featured" | "justreleased" | "foryou" | "trending";
type TrendingPeriod = "today" | "week" | "month";

export default function ToolDirectory({
  className,
  style,
  tools = FALLBACK_TOOLS,
  pageSize = 9,
  defaultView = "grid",
  initialSearch = "",
  initialType,
  showFilters = true,
}: ToolDirectoryProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = React.useState(initialSearch);
  const [viewMode, setViewMode] = React.useState<ViewMode>("featured");
  const [trendingPeriod, setTrendingPeriod] = React.useState<TrendingPeriod>("today");
  const [freeMode, setFreeMode] = React.useState(false);
  
  // Add mounted state to prevent hydration mismatches
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Add column count state for responsive masonry
  const [columnCount, setColumnCount] = React.useState(3);

  // Update column count on window resize
  React.useEffect(() => {
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

  // Sync with external search prop
  React.useEffect(() => {
    if (initialSearch !== search) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Initialize filters with initialType if provided
  const [filters, setFilters] = React.useState<{
    categories: Set<Category>;
    pricing: Set<Pricing>;
    types: Set<ToolType>;
  }>(() => {
    const initialTypes = new Set<ToolType>();
    if (initialType === "tool") {
      // Add all tool types except websites
      initialTypes.add("Web App");
      initialTypes.add("Browser Extension");
      initialTypes.add("API");
      initialTypes.add("Mobile App");
    } else if (initialType === "website") {
      // In your schema, you might have a "Website" type or handle this differently
      // For now, we'll leave it empty and rely on the type filter in the API
    }
    return {
      categories: new Set(),
      pricing: new Set(),
      types: initialTypes,
    };
  });

  // Sync filters when initialType changes
  React.useEffect(() => {
    if (initialType === "tool") {
      setFilters((f) => ({
        ...f,
        types: new Set(["Web App", "Browser Extension", "API", "Mobile App"]),
      }));
    } else if (initialType === "website") {
      setFilters((f) => ({
        ...f,
        types: new Set(),
      }));
    } else {
      setFilters((f) => ({
        ...f,
        types: new Set(),
      }));
    }
  }, [initialType]);

  const [sortBy, setSortBy] = React.useState<SortBy>("popularity");
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Add state for API data
  const [apiTools, setApiTools] = React.useState<Tool[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isFetchingData, setIsFetchingData] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  // Debounced search input for performance
  const [debouncedQuery, setDebouncedQuery] = React.useState(search);
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  // Fetch data based on view mode
  React.useEffect(() => {
    const fetchTools = async () => {
      setIsFetchingData(true);
      try {
        const token = localStorage.getItem("bearer_token");
        let endpoint = '/api/tools/featured';
        const params = new URLSearchParams();
        
        params.append("limit", "40");
        params.append("offset", "0");
        
        if (debouncedQuery.trim()) {
          params.append("search", debouncedQuery.trim());
        }

        // Determine endpoint based on view mode
        switch (viewMode) {
          case 'featured':
            endpoint = '/api/tools/featured';
            break;
          case 'justreleased':
            endpoint = '/api/tools/latest';
            break;
          case 'foryou':
            endpoint = '/api/tools/for-you';
            break;
          case 'trending':
            endpoint = '/api/tools/trending';
            params.append('period', trendingPeriod);
            break;
        }

        const response = await fetch(`${endpoint}?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          const transformedTools = (data.tools || []).map((t: any) => ({
            id: t.id.toString(),
            title: t.title,
            description: t.description,
            category: t.category,
            pricing: t.pricing,
            type: t.type,
            rating: 4.5,
            reviews: [],
            features: Array.isArray(t.features) ? t.features : [],
            website: t.url,
            image: t.image || "",
            popularity: t.popularity || 0,
            createdAt: t.createdAt,
            isFeatured: t.isFeatured || false,
            isPremium: t.isPremium || false,
            videoUrl: t.videoUrl || null,
            extendedDescription: t.extendedDescription || null,
          }));
          setApiTools(transformedTools);
          setTotalCount(data.total || 0);
          setHasMore(transformedTools.length < (data.total || 0));
        } else {
          if (response.status === 401 && viewMode === 'foryou') {
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
          }
          setApiTools(FALLBACK_TOOLS);
          setTotalCount(FALLBACK_TOOLS.length);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching tools:", error);
        setApiTools(FALLBACK_TOOLS);
        setTotalCount(FALLBACK_TOOLS.length);
        setHasMore(false);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchTools();
  }, [viewMode, trendingPeriod, debouncedQuery, router]);

  // Load more function
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const token = localStorage.getItem("bearer_token");
      let endpoint = '/api/tools/featured';
      const params = new URLSearchParams();
      
      params.append("limit", "40"); // Load 40 more cards
      params.append("offset", apiTools.length.toString());
      
      if (debouncedQuery.trim()) {
        params.append("search", debouncedQuery.trim());
      }

      // Determine endpoint based on view mode
      switch (viewMode) {
        case 'featured':
          endpoint = '/api/tools/featured';
          break;
        case 'foryou':
          endpoint = '/api/tools/for-you';
          break;
        case 'trending':
          endpoint = '/api/tools/trending';
          params.append('period', trendingPeriod);
          break;
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        const transformedTools = (data.tools || []).map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          description: t.description,
          category: t.category,
          pricing: t.pricing,
          type: t.type,
          rating: 4.5,
          reviews: [],
          features: Array.isArray(t.features) ? t.features : [],
          website: t.url,
          image: t.image || "",
          popularity: t.popularity || 0,
          createdAt: t.createdAt,
          isFeatured: t.isFeatured || false,
          isPremium: t.isPremium || false,
          videoUrl: t.videoUrl || null,
          extendedDescription: t.extendedDescription || null,
        }));
        
        setApiTools(prev => [...prev, ...transformedTools]);
        setHasMore((apiTools.length + transformedTools.length) < (data.total || 0));
      }
    } catch (error) {
      console.error("Error loading more tools:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Simulate loading transitions on filter/sort/query changes
  const lastAppliedState = React.useRef({ q: "", f: "", s: "" });
  React.useEffect(() => {
    const key = JSON.stringify({
      q: debouncedQuery,
      f: {
        c: Array.from(filters.categories).sort(),
        p: Array.from(filters.pricing).sort(),
        t: Array.from(filters.types).sort(),
      },
      s: sortBy,
    });
    if (lastAppliedState.current.q + lastAppliedState.current.f + lastAppliedState.current.s !== key) {
      setIsLoading(true);
      const t = setTimeout(() => {
        setIsLoading(false);
        lastAppliedState.current = { q: debouncedQuery, f: JSON.stringify(filters), s: sortBy };
      }, 300);
      return () => clearTimeout(t);
    }
  }, [debouncedQuery, filters, sortBy]);

  // Use API data and filter by free mode if enabled
  const displayTools = freeMode 
    ? apiTools.filter(tool => tool.pricing === "free")
    : apiTools;

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === 'foryou' && !session?.user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setViewMode(mode);
  };

  // Get section header based on view mode
  const getSectionHeader = () => {
    switch (viewMode) {
      case 'featured':
        return { icon: Zap, text: 'Featured Tools' };
      case 'justreleased':
        return { icon: Sparkles, text: 'Just Released' };
      case 'foryou':
        return { icon: Send, text: 'For You' };
      case 'trending':
        return { icon: TrendingUp, text: 'Trending' };
      default:
        return { icon: Zap, text: 'Featured Tools' };
    }
  };

  const sectionHeader = getSectionHeader();

  function toggleSet<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function handleVisit(tool: Tool) {
    toast("Opening website", {
      description: tool.website,
    });
    // Let the anchor handle navigation via href
  }

  function clearAll() {
    setFilters({ categories: new Set(), pricing: new Set(), types: new Set() });
    setSearch("");
    setSortBy("popularity");
  }

  const hasActiveFiltersCheck = hasActiveFilters(filters, search, sortBy);

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className={cn("space-y-6", className)} style={style}>
        <LoadingGridSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)} style={style} suppressHydrationWarning>
      {/* Navigation Bar - 4 tabs with responsive design */}
      <div className="sticky top-16 z-40 -mx-4 px-4 py-3 sm:py-4 bg-background/95 backdrop-blur-md flex justify-center">
        <div className="inline-flex rounded-xl bg-muted/80 backdrop-blur-sm p-1 sm:p-1.5 shadow-lg border border-border/50 w-full max-w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => handleViewModeChange("featured")}
            className={cn(
              "px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-1 sm:flex-initial",
              viewMode === "featured"
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Featured
          </button>
          <button
            onClick={() => handleViewModeChange("justreleased")}
            className={cn(
              "px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-1 sm:flex-initial",
              viewMode === "justreleased"
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Just Released
          </button>
          <button
            onClick={() => handleViewModeChange("foryou")}
            className={cn(
              "px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-1 sm:flex-initial",
              viewMode === "foryou"
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            For You
          </button>
          <button
            onClick={() => handleViewModeChange("trending")}
            className={cn(
              "px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-all whitespace-nowrap flex-1 sm:flex-initial",
              viewMode === "trending"
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Trending Period Filter */}
      {viewMode === 'trending' && (
        <div className="flex justify-center px-4">
          <div className="inline-flex rounded-lg bg-secondary/50 p-1 gap-1 w-full max-w-md sm:w-auto">
            <button
              onClick={() => setTrendingPeriod('today')}
              className={cn(
                "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-initial",
                trendingPeriod === 'today'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Today
            </button>
            <button
              onClick={() => setTrendingPeriod('week')}
              className={cn(
                "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-initial",
                trendingPeriod === 'week'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              This Week
            </button>
            <button
              onClick={() => setTrendingPeriod('month')}
              className={cn(
                "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-initial",
                trendingPeriod === 'month'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              This Month
            </button>
          </div>
        </div>
      )}

      {/* Section Header with Active Search Indicator - Responsive */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <sectionHeader.icon className="h-5 w-5 text-chart-3" />
              <h2 className="text-lg sm:text-xl font-bold">{sectionHeader.text}</h2>
            </div>
            {debouncedQuery && (
              <Badge variant="secondary" className="gap-1.5">
                <Search className="h-3 w-3" />
                Searching: "{debouncedQuery}"
              </Badge>
            )}
          </div>
          
          {/* Free Mode Toggle - Better mobile positioning */}
          <button
            onClick={() => setFreeMode(!freeMode)}
            className={cn(
              "inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shadow-sm self-start sm:self-auto",
              freeMode
                ? "bg-chart-2 text-white hover:bg-chart-2/90"
                : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
            )}
          >
            <span className={cn(
              "flex h-4 w-8 rounded-full transition-all relative",
              freeMode ? "bg-white/30" : "bg-muted-foreground/30"
            )}>
              <span className={cn(
                "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all shadow-sm",
                freeMode ? "left-4" : "left-0.5"
              )} />
            </span>
            <span>Free mode</span>
          </button>
        </div>
      </div>

      {/* Centered Grid with Padding */}
      {isFetchingData ? (
        apiTools.length > 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-lg border border-border">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
            </div>
            <div className="mx-auto max-w-7xl px-4">
              <MasonryLayout columnCount={columnCount}>
                {apiTools.map((tool, index) => (
                  <DynamicToolCard 
                    key={tool.id} 
                    tool={tool as DynamicTool} 
                    index={index}
                  />
                ))}
              </MasonryLayout>
            </div>
          </div>
        ) : (
          <LoadingGridSkeleton />
        )
      ) : displayTools.length === 0 ? (
        <EmptyState searchQuery={debouncedQuery} />
      ) : (
        <>
          {/* Centered Dynamic Masonry Grid */}
          <div className="mx-auto max-w-7xl px-4">
            <MasonryLayout columnCount={columnCount}>
              {displayTools.map((tool, index) => (
                <DynamicToolCard 
                  key={tool.id} 
                  tool={tool as DynamicTool} 
                  index={index}
                />
              ))}
            </MasonryLayout>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="min-w-[200px]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More (${totalCount - displayTools.length} remaining)`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
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

function EmptyState({ searchQuery }: { searchQuery?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-3">
        {searchQuery ? <Search className="h-6 w-6 text-muted-foreground" /> : <Zap className="h-6 w-6 text-muted-foreground" />}
      </span>
      <h3 className="text-base sm:text-lg font-semibold">
        {searchQuery ? `No results for "${searchQuery}"` : "No results found"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">
        {searchQuery 
          ? "Try adjusting your search term or explore different categories."
          : "Try adjusting your filters. You can also reset all filters to see everything available."
        }
      </p>
    </div>
  );
}

function renderPageNumbers({
  current,
  total,
  onSelect,
}: {
  current: number;
  total: number;
  onSelect: (p: number) => void;
}) {
  const pages = getPaginationRange(current, total, 1);
  return pages.map((p, idx) =>
    typeof p === "number" ? (
      <Button
        key={`${p}-${idx}`}
        size="sm"
        variant={p === current ? "default" : "outline"}
        onClick={() => onSelect(p)}
        className={p === current ? "bg-primary text-primary-foreground" : ""}
        aria-current={p === current ? "page" : undefined}
      >
        {p}
      </Button>
    ) : (
      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
        …
      </span>
    )
  );
}

function getPaginationRange(current: number, total: number, siblingCount = 1) {
  const totalPageNumbers = siblingCount * 2 + 5;
  if (total <= totalPageNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSiblingIndex = Math.max(current - siblingCount, 1);
  const rightSiblingIndex = Math.min(current + siblingCount, total);
  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < total - 2;
  const firstPageIndex = 1;
  const lastPageIndex = total;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = range(1, leftItemCount);
    return [...leftRange, "dots", total];
  } else if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = range(total - rightItemCount + 1, total);
    return [firstPageIndex, "dots", ...rightRange];
  } else {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [firstPageIndex, "dots", ...middleRange, "dots", lastPageIndex];
  }
}

function range(start: number, end: number) {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

function toggleSetGeneric<T>(s: Set<T>, value: T) {
  const next = new Set(s);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function hasActiveFilters(
  filters: {
    categories: Set<Category>;
    pricing: Set<Pricing>;
    types: Set<ToolType>;
  },
  query: string,
  sortBy: SortBy
) {
  return (
    filters.categories.size > 0 ||
    filters.pricing.size > 0 ||
    filters.types.size > 0 ||
    query.trim().length > 0 ||
    sortBy !== "popularity"
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}