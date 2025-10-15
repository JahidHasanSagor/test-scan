"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Star,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Crown,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  X,
  Search,
  Filter,
  Play,
  Eye,
  Calendar,
  DollarSign,
  Link2 as LinkIcon,
  Loader2,
  BookmarkCheck,
  Bookmark,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import { EnhancedSpiderChart } from "@/components/tool-analytics/enhanced-spider-chart";

type Tool = {
  id: number;
  title: string;
  description: string;
  url: string;
  image: string | null;
  category: string;
  pricing: string;
  type: string;
  features: string[] | null;
  popularity: number;
  isFeatured: boolean;
  status: string;
  submittedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  spiderMetrics?: {
    contentQuality: number;
    speedEfficiency: number;
    creativeFeatures: number;
    integrationOptions: number;
    learningCurve: number;
    valueForMoney: number;
  };
};

type StructuredReview = {
  id: number;
  toolId: number;
  userId: string;
  category: string;
  metricScores: Record<string, number>;
  metricComments: Record<string, string>;
  overallRating: number;
  reviewText: string | null;
  reviewerType: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type SimilarTool = {
  id: number;
  title: string;
  description: string;
  url: string;
  image: string | null;
  category: string;
  pricing: string;
  popularity: number;
};

// Utility functions
function truncateWords(text: string, maxWords: number): string {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

function getDeveloperInitials(developerName: string | null, fallback: string): string {
  if (!developerName) return fallback;
  return developerName.split(' ').map(n => n[0]).toUpperCase().join('');
}

function extractToolMetadata(features: string[] | null) {
  const metadata = {
    screenshots: [] as string[],
    currentVersion: null as string | null,
    releaseNotes: null as string | null,
    actualFeatures: [] as string[],
    developerName: null as string | null,
    developerWebsite: null as string | null,
    developerDescription: null as string | null,
    pros: [] as string[],
    cons: [] as string[],
  };

  if (!features) return metadata;

  features.forEach((feature) => {
    if (typeof feature !== 'string') return;
    
    if (feature.startsWith('screenshot:')) {
      metadata.screenshots.push(feature.replace('screenshot:', ''));
    } else if (feature.startsWith('version:')) {
      metadata.currentVersion = feature.replace('version:', '');
    } else if (feature.startsWith('releaseNotes:')) {
      metadata.releaseNotes = feature.replace('releaseNotes:', '');
    } else if (feature.startsWith('developerName:')) {
      metadata.developerName = feature.replace('developerName:', '');
    } else if (feature.startsWith('developerWebsite:')) {
      metadata.developerWebsite = feature.replace('developerWebsite:', '');
    } else if (feature.startsWith('developerDescription:')) {
      metadata.developerDescription = feature.replace('developerDescription:', '');
    } else if (feature.startsWith('pro:')) {
      metadata.pros.push(feature.replace('pro:', ''));
    } else if (feature.startsWith('con:')) {
      metadata.cons.push(feature.replace('con:', ''));
    } else if (!feature.includes(':')) {
      metadata.actualFeatures.push(feature);
    }
  });

  return metadata;
}

interface ToolDetailClientProps {
  initialTool: Tool;
  initialSimilarTools: SimilarTool[];
  initialReviews: StructuredReview[];
  toolId: string;
}

export const ToolDetailClient: React.FC<ToolDetailClientProps> = ({
  initialTool,
  initialSimilarTools,
  initialReviews,
  toolId,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const tool = initialTool;
  const structuredReviews = initialReviews;
  const similarTools = initialSimilarTools;

  // Extract metadata from features array
  const metadata = extractToolMetadata(tool.features);
  const {
    screenshots: extractedScreenshots,
    currentVersion,
    releaseNotes,
    actualFeatures: metadataFeatures,
    developerName: metadataDeveloperName,
    developerWebsite: metadataDeveloperWebsite,
    developerDescription: metadataDeveloperDescription,
    pros,
    cons,
  } = metadata;

  // Check if tool is saved
  React.useEffect(() => {
    if (!session?.user) return;

    const checkSaved = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        const savedRes = await fetch(`/api/saved/${toolId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setIsSaved(savedData.isSaved || false);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkSaved();
  }, [toolId, session]);

  const handleSave = async () => {
    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent(`/tool/${toolId}`)}`);
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/saved/${toolId}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from saved" : "Added to saved");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const averageRating = structuredReviews.length > 0
    ? structuredReviews.reduce((sum, r) => sum + r.overallRating, 0) / structuredReviews.length
    : 0;

  // Truncate tool title to 5 words for display
  const displayTitle = truncateWords(tool.title, 5);

  // Build screenshots array from extracted data
  const screenshots = React.useMemo(() => {
    const items: Array<{ id: number; type: "video" | "image"; url?: string; label: string }> = [];
    
    // Add video if premium and videoUrl exists
    if ((tool as any).isPremium && (tool as any).videoUrl) {
      items.push({ id: 0, type: "video", url: (tool as any).videoUrl, label: "Video Demo" });
    }
    
    // Add extracted screenshots
    extractedScreenshots.forEach((url, idx) => {
      items.push({
        id: idx + 1,
        type: "image",
        url,
        label: `Screenshot ${idx + 1}`
      });
    });
    
    return items;
  }, [(tool as any).isPremium, (tool as any).videoUrl, extractedScreenshots]);

  // Use actual features from metadata
  const actualFeatures = metadataFeatures.length > 0 
    ? metadataFeatures 
    : tool.features?.filter(f => typeof f === 'string' && !f.includes(':')) || [];

  // Get developer info
  const developerName = metadataDeveloperName || `${tool.title} Team`;
  const developerWebsite = metadataDeveloperWebsite || tool.url;
  const developerDescription = metadataDeveloperDescription || "Dedicated to creating innovative solutions that help teams work smarter and achieve more.";
  const developerInitials = getDeveloperInitials(metadataDeveloperName, tool.title.substring(0, 2).toUpperCase());

  // Demo data for sections not yet captured (can be removed later)
  const demoThreads = [
    {
      id: 1,
      author: "Sarah Johnson",
      time: "2 days ago",
      comment: "This tool has completely transformed my workflow. The AI features are incredibly accurate!"
    },
    {
      id: 2,
      author: "Mike Chen",
      time: "1 week ago",
      comment: "Great UI/UX design. Very intuitive and easy to learn."
    },
    {
      id: 3,
      author: "Emily Davis",
      time: "2 weeks ago",
      comment: "Excellent value for money. Highly recommended for teams of all sizes."
    }
  ];

  const demoPros = [
    "Excellent user interface and experience",
    "Powerful AI-driven features",
    "Great customer support",
    "Regular updates and improvements"
  ];

  const demoCons = [
    "Pricing can be steep for individuals",
    "Learning curve for advanced features",
    "Limited offline functionality"
  ];

  const demoVersions = [
    {
      version: "1.0.8",
      date: "Jan 15, 2025",
      changes: [
        "Improved AI accuracy by 20%",
        "Added dark mode support",
        "Fixed critical bugs in export feature"
      ]
    },
    {
      version: "1.0.7",
      date: "Dec 10, 2024",
      changes: [
        "New template library",
        "Performance optimizations",
        "Enhanced security features"
      ]
    }
  ];

  const categories = [
    { name: "AI Writing", count: 45 },
    { name: "Marketing", count: 38 },
    { name: "Development", count: 52 },
    { name: "Design", count: 41 },
    { name: "Productivity", count: 67 },
    { name: "Analytics", count: 29 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        showSearch={false}
        showAuth={false}
        customAuthSlot={
          session?.user ? (
            <ProfileTrigger onClick={() => setSidebarOpen(true)} />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-secondary">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="shadow-sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )
        }
      />

      <ProfileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Mobile Filter Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-semibold">Filters & Search</h3>
              <Button variant="ghost" size="sm" onClick={() => setFilterDrawerOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Search Tools</h3>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-secondary transition-colors ${
                          selectedCategory === cat.name ? "bg-secondary" : ""
                        }`}
                      >
                        <span>{cat.name}</span>
                        <Badge variant="outline" className="text-xs">{cat.count}</Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Advanced Filters</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Pricing</label>
                      <select className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background">
                        <option>All</option>
                        <option>Free</option>
                        <option>Freemium</option>
                        <option>Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Rating</label>
                      <select className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background">
                        <option>All Ratings</option>
                        <option>4+ Stars</option>
                        <option>3+ Stars</option>
                      </select>
                    </div>
                    <Separator />
                    <Button variant="outline" size="sm" className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Global Header - Hidden on mobile */}
      <div className="hidden lg:block border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h2 className="font-semibold text-sm">{tool.title}</h2>
                <p className="text-xs text-muted-foreground">{tool.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <Link href="/tools" className="hover:text-foreground">Tools</Link>
              <Link href="/blog" className="hover:text-foreground">Blog</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="sticky top-0 z-40 lg:hidden bg-card border-b border-border shadow-sm">
        <div className="px-3 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{displayTitle}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
                {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
              </span>
              <span>•</span>
              <span className="capitalize">{tool.pricing}</span>
            </div>
          </div>
          <Button size="sm" onClick={handleSave} disabled={isSaving} variant="outline" className="shrink-0">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="px-3 pb-3">
          <Button size="sm" className="w-full gap-2" asChild>
            <a href={tool.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Use Tool
            </a>
          </Button>
        </div>
      </div>

      {/* Floating Filter Button - Mobile Only */}
      <button
        onClick={() => setFilterDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Filter className="h-5 w-5" />
      </button>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* App Header - Desktop Only (hidden on mobile due to sticky bar) */}
              <Card className="hidden lg:block">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {tool.image && (
                      <div className="relative h-24 w-24 shrink-0">
                        <Image
                          src={tool.image}
                          alt={`${tool.title} logo`}
                          fill
                          className="rounded-2xl border-2 border-border object-cover"
                          sizes="96px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-2">{displayTitle}</h1>
                      <p className="text-sm text-muted-foreground mb-3">{truncateWords(tool.description, 5)}</p>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex text-chart-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm font-semibold">{averageRating > 0 ? averageRating.toFixed(1) : "N/A"}</span>
                        <span className="text-xs text-muted-foreground">({structuredReviews.length} reviews)</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-secondary/50">{tool.category}</Badge>
                        <Badge variant="outline" className="bg-secondary/50 capitalize">{tool.pricing}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button size="sm" className="gap-2" asChild>
                          <a href={tool.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                            Use Tool
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isSaved ? (
                            <BookmarkCheck className="h-3 w-3" />
                          ) : (
                            <Bookmark className="h-3 w-3" />
                          )}
                          {isSaved ? "Saved" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Hero Card */}
              <Card className="lg:hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4 mb-4">
                    {tool.image && (
                      <div className="relative h-20 w-20 shrink-0">
                        <Image
                          src={tool.image}
                          alt={`${tool.title} logo`}
                          fill
                          className="rounded-xl border-2 border-border object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold mb-1">{displayTitle}</h1>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-secondary/50 text-xs">{tool.category}</Badge>
                        <Badge variant="outline" className="bg-secondary/50 capitalize text-xs">{tool.pricing}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{truncateWords(tool.description, 5)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex text-chart-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">{averageRating > 0 ? averageRating.toFixed(1) : "N/A"}</span>
                    <span className="text-xs text-muted-foreground">({structuredReviews.length})</span>
                  </div>
                </CardContent>
              </Card>

              {/* Screenshots & Video */}
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-semibold mb-3">Screenshots & Video</h3>
                  {screenshots.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {screenshots.map((item) => (
                        <div
                          key={item.id}
                          className="w-40 lg:w-48 h-24 lg:h-28 shrink-0 rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer relative group"
                        >
                          {item.type === "video" && item.url ? (
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center">
                                <Play className="h-8 w-8 text-primary mb-1" />
                                <span className="text-xs font-medium text-primary">{item.label}</span>
                              </div>
                            </div>
                          ) : item.url ? (
                            <Image
                              src={item.url}
                              alt={item.label}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 160px, 192px"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground">
                              {item.label}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <p className="text-sm text-muted-foreground">No screenshots or videos available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-semibold mb-3">Description</h3>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>

              {/* Extended Description - Premium Only */}
              {tool.isPremium && tool.extendedDescription && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">In-Depth Overview</h3>
                      <Badge variant="secondary" className="ml-auto">Premium</Badge>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {tool.extendedDescription}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              {actualFeatures.length > 0 && (
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="text-sm font-semibold mb-3">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {actualFeatures.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* What's New */}
              {(currentVersion || releaseNotes) && (
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold">What's New</h3>
                      {currentVersion && (
                        <Badge variant="outline" className="text-xs">{currentVersion}</Badge>
                      )}
                    </div>
                    {releaseNotes ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Latest Update</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {releaseNotes}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Version {currentVersion} is now available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* From the Threads */}
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-semibold mb-4">From the Threads</h3>
                  <div className="space-y-4">
                    {demoThreads.map((thread) => (
                      <div key={thread.id} className="border border-border rounded-lg p-3 lg:p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-xs font-semibold">
                            {thread.author.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{thread.author}</p>
                            <p className="text-xs text-muted-foreground">{thread.time}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/90">{thread.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Spider Chart Analysis */}
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-semibold mb-4">Comprehensive Analysis</h3>
                  <div className="max-w-xl mx-auto">
                    <EnhancedSpiderChart
                      toolId={parseInt(toolId)}
                      toolCategory={tool.category}
                      height={300}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Ratings & Reviews */}
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-semibold mb-4">Ratings & Reviews</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center border border-border rounded-lg p-4">
                      <div className="text-4xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : "N/A"}</div>
                      <div className="flex text-chart-4 my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">{structuredReviews.length} Ratings</div>
                    </div>

                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-2">
                          <div className="text-xs w-8">{stars}★</div>
                          <div className="flex-1 h-2 bg-secondary rounded overflow-hidden">
                            <div
                              className="h-full bg-chart-4"
                              style={{ width: `${(5 - stars) * 15 + 10}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {structuredReviews.slice(0, 2).map((review) => (
                        <div key={review.id} className="border border-border rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
                            <span className="text-xs font-semibold">{review.overallRating}/10</span>
                          </div>
                          <p className="text-xs text-foreground/80 line-clamp-2">
                            {review.reviewText || "Great tool!"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pros & Cons Section */}
              {(pros.length > 0 || cons.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Pros & Cons</CardTitle>
                      <CardDescription>
                        Balanced overview of strengths and limitations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pros */}
                        {pros.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <div className="h-8 w-8 rounded-full bg-chart-2/20 flex items-center justify-center">
                                <ThumbsUp className="h-4 w-4 text-chart-2" />
                              </div>
                              <h3 className="font-semibold text-chart-2">Advantages</h3>
                            </div>
                            <ul className="space-y-3">
                              {pros.map((pro, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
                                  <span className="text-sm text-foreground/80">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Cons */}
                        {cons.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <div className="h-8 w-8 rounded-full bg-chart-4/20 flex items-center justify-center">
                                <ThumbsDown className="h-4 w-4 text-chart-4" />
                              </div>
                              <h3 className="font-semibold text-chart-4">Considerations</h3>
                            </div>
                            <ul className="space-y-3">
                              {cons.map((con, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className="h-5 w-5 rounded-full border-2 border-chart-4 shrink-0 mt-0.5" />
                                  <span className="text-sm text-foreground/80">{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Version History */}
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-semibold mb-4">Version History</h3>
                  <div className="space-y-5">
                    {demoVersions.map((version, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{version.version}</Badge>
                          <span className="text-xs text-muted-foreground">{version.date}</span>
                        </div>
                        <ul className="space-y-1 ml-4">
                          {version.changes.map((change, j) => (
                            <li key={j} className="text-sm text-foreground/80 list-disc">{change}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Developer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-chart-5/20 rounded-full flex items-center justify-center text-lg font-bold">
                      {developerInitials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{developerName}</p>
                      <p className="text-xs text-muted-foreground">Software Company</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {developerDescription}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs gap-1.5" asChild>
                      <a href={developerWebsite} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="h-3 w-3" />
                        Website
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                      <MessageSquare className="h-3 w-3" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tool Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Total Views</span>
                      </div>
                      <span className="text-sm font-semibold">{tool.popularity.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star className="h-3.5 w-3.5" />
                        <span>Reviews</span>
                      </div>
                      <span className="text-sm font-semibold">{structuredReviews.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Listed</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {new Date(tool.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Pricing</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{tool.pricing}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Similar Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {similarTools.slice(0, 4).map((similarTool) => (
                      <Link 
                        key={similarTool.id} 
                        href={`/tool/${similarTool.id}`}
                        className="block p-3 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          {similarTool.image && (
                            <div className="relative w-10 h-10 shrink-0">
                              <Image
                                src={similarTool.image}
                                alt={similarTool.title}
                                fill
                                className="rounded-lg object-cover"
                                sizes="40px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {similarTool.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {truncateWords(similarTool.description, 40)}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {similarTool.category}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};