"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard, SkeletonStats } from "@/components/ui/skeleton-card";
import { ProgressLevel, calculateUserLevel, calculateNextLevelXP, calculateXP } from "@/components/gamification/progress-level";
import { AchievementList, AchievementType } from "@/components/gamification/achievement-badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Bookmark, 
  Settings, 
  TrendingUp, 
  Eye,
  Star,
  ExternalLink,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Trophy,
  Plus,
  Edit,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { sanitizeUrl } from "@/lib/security/url-sanitizer";

interface SavedTool {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
  saved_at: string;
}

interface SubmittedTool {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
  status: string;
  created_at: string;
  view_count: number;
  average_rating: number;
}

interface UserStats {
  saved_count: number;
  submitted_count: number;
  total_views: number;
}

// Count-up animation hook
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(end * percentage));
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color,
  index 
}: { 
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; 
  label: string; 
  value: number; 
  color: string;
  index: number;
}) {
  const animatedValue = useCountUp(value, 1000);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <motion.p 
              className="mt-1 text-3xl font-bold"
              key={animatedValue}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {animatedValue}
            </motion.p>
          </div>
          <div className={`rounded-lg ${color} p-3`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [savedTools, setSavedTools] = React.useState<SavedTool[]>([]);
  const [submittedTools, setSubmittedTools] = React.useState<SubmittedTool[]>([]);
  const [stats, setStats] = React.useState<UserStats>({
    saved_count: 0,
    submitted_count: 0,
    total_views: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"saved" | "submitted">("saved");
  const [achievements, setAchievements] = React.useState<Array<{ type: AchievementType; unlocked: boolean }>>([]);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [session, isPending, router]);

  // Fetch user data
  React.useEffect(() => {
    if (!session?.user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("bearer_token");
        let savedData: any[] = []; // Initialize with empty array

        // Fetch saved tools with proper field mapping
        const savedRes = await fetch(`/api/saved?userId=${session.user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (savedRes.ok) {
          savedData = await savedRes.json();
          // Map savedAt to saved_at for consistency
          const mappedSavedTools = savedData.map((tool: any) => ({
            ...tool,
            saved_at: tool.savedAt || tool.saved_at || tool.createdAt
          }));
          setSavedTools(mappedSavedTools);
        } else {
          console.error("Failed to fetch saved tools:", await savedRes.text());
          toast.error("Failed to load saved tools");
        }

        // Fetch submitted tools
        const submittedRes = await fetch("/api/tools?status=all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (submittedRes.ok) {
          const submittedData = await submittedRes.json();
          const userTools = (submittedData.tools || submittedData).filter(
            (tool: any) => tool.submittedByUserId === session.user.id
          );
          setSubmittedTools(userTools);

          const totalViews = userTools.reduce(
            (sum: number, tool: any) => sum + (tool.view_count || 0),
            0
          );
          setStats({
            saved_count: savedData.length, // Now safely using initialized savedData
            submitted_count: userTools.length,
            total_views: totalViews,
          });

          // Calculate achievements
          const userAchievements: Array<{ type: AchievementType; unlocked: boolean }> = [
            { type: "first_save", unlocked: savedData.length >= 1 },
            { type: "first_submit", unlocked: userTools.length >= 1 },
            { type: "power_contributor", unlocked: userTools.length >= 10 },
            { type: "community_favorite", unlocked: totalViews >= 100 },
            { type: "explorer", unlocked: savedData.length >= 25 },
            { type: "curator", unlocked: savedData.length >= 50 },
            { type: "influencer", unlocked: totalViews >= 1000 },
          ];
          setAchievements(userAchievements);
        } else {
          console.error("Failed to fetch submitted tools:", await submittedRes.text());
          toast.error("Failed to load submitted tools");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleRemoveSaved = async (toolId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/saved/${toolId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setSavedTools((prev) => prev.filter((tool) => tool.id !== toolId));
        setStats((prev) => ({ ...prev, saved_count: prev.saved_count - 1 }));
        toast.success("Removed from saved tools");
      } else {
        toast.error("Failed to remove tool");
      }
    } catch (error) {
      console.error("Error removing saved tool:", error);
      toast.error("Failed to remove tool");
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader showAuth />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
          </div>
          <SkeletonStats />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const xp = calculateXP(stats);
  const currentLevel = calculateUserLevel(xp);
  const nextLevelXP = calculateNextLevelXP(currentLevel);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader 
        showAuth={false}
        customAuthSlot={<ProfileTrigger onClick={() => setSidebarOpen(true)} />}
      />
      <ProfileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="container mx-auto px-4 py-8">
        {/* Header with Gamification */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Dashboard
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {currentLevel}
                </Badge>
              </h1>
              <p className="mt-1 text-muted-foreground">
                Welcome back, {session.user.name || session.user.email}!
              </p>
            </div>
            
            {/* Quick Action Button */}
            <Button 
              size="lg" 
              className="shadow-sm gap-2"
              onClick={() => router.push("/submit")}
            >
              <Plus className="h-4 w-4" />
              Submit New Tool
            </Button>
          </div>

          {/* Progress Level */}
          <Card className="p-6 mb-6 bg-gradient-to-br from-card via-card to-accent/5">
            <ProgressLevel
              currentLevel={currentLevel}
              currentXP={xp}
              nextLevelXP={nextLevelXP}
              showAnimation={true}
            />
          </Card>

          {/* Achievements */}
          {unlockedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-chart-4" />
                    <h3 className="font-semibold">Achievements</h3>
                  </div>
                  <Badge variant="secondary">
                    {unlockedCount}/{achievements.length}
                  </Badge>
                </div>
                <AchievementList achievements={achievements} />
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Bookmark}
            label="Saved Tools"
            value={stats.saved_count}
            color="bg-chart-2/10 text-chart-2"
            index={0}
          />
          <StatCard
            icon={TrendingUp}
            label="Submitted Tools"
            value={stats.submitted_count}
            color="bg-chart-3/10 text-chart-3"
            index={1}
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.total_views}
            color="bg-chart-4/10 text-chart-4"
            index={2}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab("saved")}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "saved"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Saved Tools
            {activeTab === "saved" && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                layoutId="activeTab"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("submitted")}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "submitted"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Submitted Tools
            {activeTab === "submitted" && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                layoutId="activeTab"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {savedTools.length === 0 ? (
                <EmptyState
                  icon={Bookmark}
                  title="No saved tools yet"
                  description="Start exploring and save your favorite tools to see them here"
                  action={{
                    label: "Browse Tools",
                    onClick: () => router.push("/"),
                  }}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {savedTools.map((tool, index) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {tool.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {tool.description}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {tool.category}
                              </Badge>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Saved {new Date(tool.saved_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSaved(tool.id)}
                            className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <a
                              href={sanitizeUrl(tool.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit
                              <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "submitted" && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {submittedTools.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No submitted tools yet"
                  description="Share your favorite tools with the community and track their performance"
                  action={{
                    label: "Submit Tool",
                    onClick: () => router.push("/submit"),
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {/* Pending Tools Alert */}
                  {submittedTools.some(t => t.status === "pending") && (
                    <Card className="bg-chart-4/5 border-chart-4/20">
                      <div className="p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-chart-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">Tools Pending Review</h4>
                          <p className="text-xs text-muted-foreground">
                            Your tools are being reviewed by our team. This usually takes 1-2 business days.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {submittedTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-semibold line-clamp-2">{tool.title}</h3>
                            {tool.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={() => router.push(`/submit?edit=${tool.id}`)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {tool.description}
                          </p>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge
                              variant={
                                tool.status === "approved"
                                  ? "default"
                                  : tool.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {tool.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {tool.category}
                            </Badge>
                          </div>

                          {tool.status === "approved" && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {tool.view_count || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {tool.average_rating?.toFixed(1) || "0.0"}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Calendar className="h-3 w-3" />
                            {new Date(tool.created_at).toLocaleDateString()}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit Tool
                              <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
}