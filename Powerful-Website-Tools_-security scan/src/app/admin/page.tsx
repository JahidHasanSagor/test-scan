"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  ArrowUpRight,
  Wrench,
  MessageSquare,
  Eye,
  Sparkles,
  Activity,
  Zap,
  DollarSign,
  ArrowRight,
  X,
  Filter,
  Flame,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type Stats = {
  totalTools: number;
  pendingTools: number;
  approvedTools: number;
  totalReviews: number;
  totalUsers?: number;
  totalViews?: number;
  monthlyGrowth?: {
    tools: number;
    users: number;
    reviews: number;
    revenue: number;
  };
};

type RecentActivity = {
  id: number;
  type: "tool_submitted" | "tool_approved" | "review_posted";
  title: string;
  time: string;
  user?: string;
};

type AIInsight = {
  id: number;
  type: "trend" | "alert" | "suggestion";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action?: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = React.useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dismissedAlerts, setDismissedAlerts] = React.useState<number[]>([]);
  const [selectedKPI, setSelectedKPI] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchDashboardData();
    // Simulate real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced AI insights with actions
  const aiInsights: AIInsight[] = [
    {
      id: 1,
      type: "trend",
      title: "AI Writing Tools Surging",
      description: "AI writing category saw 45% increase in submissions this week. Projected surge: 12.5K views next week.",
      priority: "high",
      action: "/admin/tools?category=AI+Writing",
    },
    {
      id: 2,
      type: "alert",
      title: "Spam Surge Detected",
      description: "12 suspicious submissions flagged in last 24hrs. AI confidence: 89%. Review immediately.",
      priority: "high",
      action: "/admin/tools?spam=true",
    },
    {
      id: 3,
      type: "alert",
      title: "Review Response Time",
      description: "Average tool approval time is 3.2 days. Target is 2 days. 8 tools need urgent attention.",
      priority: "medium",
      action: "/admin/tools?status=pending&urgent=true",
    },
    {
      id: 4,
      type: "suggestion",
      title: "Auto-categorization Ready",
      description: "12 pending tools could benefit from AI auto-categorization. Estimated time savings: 25 mins.",
      priority: "low",
      action: "/admin/tools?uncategorized=true",
    },
  ];

  const visibleInsights = aiInsights.filter(insight => !dismissedAlerts.includes(insight.id));

  const handleDismissAlert = (id: number) => {
    setDismissedAlerts(prev => [...prev, id]);
    toast.success("Alert dismissed");
  };

  const handleKPIClick = (kpi: string, filterUrl: string) => {
    setSelectedKPI(kpi);
    toast.success(`Filtering tools by: ${kpi}`);
    setTimeout(() => {
      window.location.href = filterUrl;
    }, 500);
  };

  const statCards = [
    {
      title: "Total Submissions",
      subtitle: "All time count",
      value: stats?.totalTools || "1,247",
      change: 54.1,
      forecast: "+187 projected this week",
      changeLabel: "vs last month",
      icon: Wrench,
      color: "text-purple-600",
      bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      trend: "up",
      filterUrl: "/admin/tools",
    },
    {
      title: "Active Users",
      subtitle: "Platform engagement",
      value: stats?.totalUsers || "9,428",
      change: 14.1,
      forecast: "+320 expected growth",
      changeLabel: "from last month",
      icon: Users,
      color: "text-blue-600",
      bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      trend: "up",
      filterUrl: "/admin/users",
    },
    {
      title: "Total Revenue",
      subtitle: "Monthly earnings",
      value: "$12,563",
      change: 7.35,
      forecast: "$15.2K projected",
      changeLabel: "vs last month",
      icon: DollarSign,
      color: "text-green-600",
      bgGradient: "from-green-500/10 via-green-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      trend: "up",
      filterUrl: "/admin/analytics",
    },
  ];

  const secondaryStats = [
    {
      title: "Pending Approval",
      value: stats?.pendingTools || 0,
      subtitle: "Needs attention",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/50",
      action: { label: "Review", href: "/admin/tools?status=pending" },
    },
    {
      title: "Approved Tools",
      value: stats?.approvedTools || 0,
      subtitle: "+8% from last month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50",
      action: { label: "Manage", href: "/admin/tools?status=approved" },
    },
    {
      title: "Total Reviews",
      value: stats?.totalReviews || 0,
      subtitle: "+23% engagement",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50",
      action: { label: "View", href: "/admin/analytics" },
    },
    {
      title: "Active Users",
      value: stats?.totalUsers || "2.4K",
      subtitle: "+12% this week",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50",
      action: { label: "Details", href: "/admin/users" },
    },
  ];

  // Compact Approval Funnel Data
  const approvalFunnel = [
    { stage: "Submitted", count: stats?.totalTools || 1247, percentage: 100, color: "bg-blue-500" },
    { stage: "Under Review", count: stats?.pendingTools || 45, percentage: 3.6, color: "bg-yellow-500" },
    { stage: "Approved", count: stats?.approvedTools || 1180, percentage: 94.6, color: "bg-green-500" },
    { stage: "Featured", count: 23, percentage: 1.8, color: "bg-purple-500" },
  ];

  const approvalRate = 94.6;

  return (
    <div className="space-y-8">
      {/* Header with Real-time Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-display">Analytics Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor your platform's performance, user engagement, and tool submissions in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
          <span className="hidden sm:inline">Live Updates</span>
        </div>
      </div>

      {/* Portfolio Performance - Main KPI Cards with Click Actions */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
          <CardTitle className="text-lg">Portfolio Performance</CardTitle>
          <CardDescription>Click any metric to filter and explore detailed insights</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
              const trendColor = stat.trend === "up" ? "text-green-600" : "text-red-600";
              
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleKPIClick(stat.title, stat.filterUrl)}
                  className={`relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br ${stat.bgGradient} border border-border hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group`}
                >
                  <div className={`rounded-full p-4 ${stat.iconBg} shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      {stat.title}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold">{stat.value}</span>
                    </div>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
                      <TrendIcon className="h-4 w-4" />
                      {stat.change}% {stat.changeLabel}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">
                      📈 {stat.forecast}
                    </p>
                  </div>
                  <Filter className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts - Move up for better visibility */}
      {stats?.pendingTools && stats.pendingTools > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-200 dark:border-amber-900 shadow-lg shadow-amber-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-950 p-3 shadow-lg">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Action Required</h3>
                  <p className="text-muted-foreground mt-1">
                    {stats.pendingTools} tool{stats.pendingTools > 1 ? "s are" : " is"} pending review.
                    Quick approval helps maintain platform quality and user satisfaction.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Link href="/admin/tools">
                      <Button className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                        Review Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline">Snooze</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {/* Compact Metrics Grid with Funnel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compact Approval Funnel - Now smaller */}
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Approval Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvalFunnel.map((stage, index) => (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{stage.stage}</span>
                  <span className="font-semibold">{stage.count.toLocaleString("en-US")}</span>
                </div>
                <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stage.percentage, 100)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full ${stage.color}`}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Approval Rate</span>
                <Badge variant="secondary" className="text-xs">
                  {approvalRate}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Stats - Now 2 columns */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          {secondaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <div className={`rounded-lg p-2 ${stat.bgColor} shadow-sm`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    <Link href={stat.action.href}>
                      <Button variant="ghost" size="sm" className="mt-3 w-full gap-2 hover:bg-primary/10">
                        {stat.action.label}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Insights & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Enhanced AI Insights with Dismissible Alerts */}
        <Card className="border-purple-200 dark:border-purple-900 shadow-lg shadow-purple-500/10">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 via-purple-50/50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </div>
              <Badge variant="secondary" className="gap-1 shadow-sm">
                <Zap className="h-3 w-3" />
                Live
              </Badge>
            </div>
            <CardDescription>Intelligent recommendations with actionable insights</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {visibleInsights.map((insight) => {
                const priorityColors = {
                  high: "border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 dark:border-red-900 dark:bg-red-950",
                  medium: "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:border-amber-900 dark:bg-amber-950",
                  low: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:border-blue-900 dark:bg-blue-950",
                };
                
                const priorityIcons = {
                  high: AlertCircle,
                  medium: AlertCircle,
                  low: Sparkles,
                };
                
                const PriorityIcon = priorityIcons[insight.priority];
                
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`rounded-lg border p-3 shadow-sm hover:shadow-md transition-all ${priorityColors[insight.priority]} group relative`}
                  >
                    <button
                      onClick={() => handleDismissAlert(insight.id)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="flex items-start justify-between gap-2 pr-6">
                      <div className="flex items-start gap-2 flex-1">
                        <PriorityIcon className={`h-4 w-4 mt-0.5 ${insight.priority === 'high' ? 'text-red-600' : insight.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                          {insight.action && (
                            <Link href={insight.action}>
                              <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1 hover:gap-2 transition-all">
                                Take Action
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 capitalize text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4 gap-2 hover:bg-purple-50 dark:hover:bg-purple-950">
              <Sparkles className="h-4 w-4" />
              Generate More Insights
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Frequently used admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            <Link href="/admin/tools">
              <Button variant="outline" className="w-full justify-between gap-2 h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-2 shadow-sm">
                    <Wrench className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Manage Tools</p>
                    <p className="text-xs text-muted-foreground">Review submissions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stats?.pendingTools ? (
                    <Badge variant="destructive" className="shadow-sm">{stats.pendingTools}</Badge>
                  ) : null}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </Link>
            <Link href="/admin/blog">
              <Button variant="outline" className="w-full justify-between gap-2 h-auto py-3 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-2 shadow-sm">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Create Blog Post</p>
                    <p className="text-xs text-muted-foreground">Write new content</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-between gap-2 h-auto py-3 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-300 dark:hover:border-green-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-2 shadow-sm">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">User Management</p>
                    <p className="text-xs text-muted-foreground">Manage users & roles</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-between gap-2 h-auto py-3 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-2 shadow-sm">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Analytics Dashboard</p>
                    <p className="text-xs text-muted-foreground">View detailed stats</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Tools */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest platform updates</CardDescription>
              </div>
              <Badge variant="secondary" className="shadow-sm">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[
                { icon: Wrench, color: "blue", label: "New tool submitted", desc: "Example Tool #1 - Awaiting approval", time: "2 minutes ago" },
                { icon: CheckCircle, color: "green", label: "Tool approved", desc: "AI Writer Pro - Published successfully", time: "15 minutes ago" },
                { icon: MessageSquare, color: "purple", label: "Review posted", desc: "5-star review on ChatGPT Alternative", time: "1 hour ago" },
                { icon: Users, color: "orange", label: "New user joined", desc: "john@example.com registered", time: "2 hours ago" },
              ].map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 hover:bg-muted/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
                    <div className={`rounded-full bg-gradient-to-br from-${activity.color}-50 to-${activity.color}-100 dark:from-${activity.color}-950 dark:to-${activity.color}-900 p-2 shadow-sm`}>
                      <Icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.desc}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4 hover:bg-muted">View All Activity</Button>
          </CardContent>
        </Card>

        {/* Top Tools with Interactive Drill-down */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Top Performing Tools</CardTitle>
                <CardDescription>Most viewed this month - click for details</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <ExternalLink className="h-3 w-3" />
                Full Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[
                { name: "ChatGPT", views: "12.5K", trend: "+15%", progress: 85, category: "AI Writing" },
                { name: "Midjourney", views: "9.8K", trend: "+8%", progress: 68, category: "Image Generation" },
                { name: "Claude", views: "7.2K", trend: "+12%", progress: 52, category: "AI Assistant" },
                { name: "Runway", views: "5.9K", trend: "+20%", progress: 42, category: "Video Tools" },
              ].map((tool, i) => (
                <div key={i} className="space-y-2 pb-3 border-b last:border-0 hover:bg-muted/30 -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-bold text-primary shadow-sm">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{tool.name}</p>
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {tool.views} views
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">{tool.category}</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1 shadow-sm">
                      <ArrowUpRight className="h-3 w-3" />
                      {tool.trend}
                    </Badge>
                  </div>
                  <Progress value={tool.progress} className="h-1.5 shadow-sm" />
                </div>
              ))}
            </div>

            {/* Rising Stars Section */}
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-900">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">Rising Stars</h4>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Perplexity AI", growth: "+127%", category: "Search" },
                  { name: "Leonardo.ai", growth: "+98%", category: "Image Gen" },
                ].map((star, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="font-medium">{star.name}</span>
                      <span className="text-xs text-muted-foreground">({star.category})</span>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs">
                      {star.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4 hover:bg-muted">View Full Analytics</Button>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Category Distribution Chart */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
          <CardTitle className="text-lg">Category Distribution</CardTitle>
          <CardDescription>Tools by category - click to drill down and explore</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "AI Writing", count: 45, color: "bg-blue-500", percentage: 100, trend: "+12%" },
              { name: "Image Generation", count: 38, color: "bg-purple-500", percentage: 84, trend: "+8%" },
              { name: "Video Tools", count: 29, color: "bg-green-500", percentage: 64, trend: "+15%" },
              { name: "Code Assistants", count: 24, color: "bg-orange-500", percentage: 53, trend: "+5%" },
            ].map((category) => (
              <Link key={category.name} href={`/admin/tools?category=${encodeURIComponent(category.name)}`}>
                <div className="rounded-xl border border-border p-4 hover:border-primary hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-card to-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{category.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{category.count}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full ${category.color} shadow-lg transition-all`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">{category.percentage}% of total</p>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {category.trend}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}