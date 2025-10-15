"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Target,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

type AnalyticsData = {
  totalViews: number;
  totalUsers: number;
  totalSubmissions: number;
  avgEngagement: number;
  viewsChange: number;
  usersChange: number;
  submissionsChange: number;
  engagementChange: number;
};

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [isLoading, setIsLoading] = React.useState(false);
  const [analytics, setAnalytics] = React.useState<AnalyticsData>({
    totalViews: 45678,
    totalUsers: 3421,
    totalSubmissions: 234,
    avgEngagement: 68.5,
    viewsChange: 12.5,
    usersChange: 8.3,
    submissionsChange: 15.2,
    engagementChange: 5.7,
  });
  // Deterministic first render for SSR: initialize with stable values, randomize after mount
  const [barHeights, setBarHeights] = React.useState<number[]>(Array(30).fill(50));
  React.useEffect(() => {
    setBarHeights(Array.from({ length: 30 }, () => Math.random() * 80 + 20));
  }, []);

  const metricCards = [
    {
      title: "Total Views",
      value: analytics.totalViews.toLocaleString("en-US"),
      change: analytics.viewsChange,
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: analytics.totalUsers.toLocaleString("en-US"),
      change: analytics.usersChange,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Submissions",
      value: analytics.totalSubmissions.toLocaleString("en-US"),
      change: analytics.submissionsChange,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Engagement Rate",
      value: `${analytics.avgEngagement}%`,
      change: analytics.engagementChange,
      icon: Activity,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const topCategories = [
    { name: "AI Writing", views: 12450, tools: 45, growth: 15.3 },
    { name: "Image Generation", views: 9830, tools: 38, growth: 12.1 },
    { name: "Video Tools", views: 7210, tools: 29, growth: 8.7 },
    { name: "Code Assistants", views: 6540, tools: 24, growth: 18.9 },
    { name: "Audio Tools", views: 4320, tools: 19, growth: 6.4 },
  ];

  const recentActivity = [
    { action: "New tool submission", count: 12, time: "Today" },
    { action: "User registrations", count: 45, time: "Today" },
    { action: "Reviews posted", count: 23, time: "Today" },
    { action: "Page views", count: 1567, time: "Today" },
  ];

  const trafficSources = [
    { source: "Direct", visits: 12500, percentage: 35 },
    { source: "Google Search", visits: 10200, percentage: 28 },
    { source: "Social Media", visits: 8900, percentage: 25 },
    { source: "Referrals", visits: 4300, percentage: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-2">
            Track performance, engagement, and user behavior
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change > 0;
          
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {isPositive ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {metric.change}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic Overview</CardTitle>
            <CardDescription>Page views over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between gap-2 border-b border-border pb-4">
              {barHeights.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-chart-3 to-chart-5 rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`Day ${i + 1}: ${Math.floor(height * 50)} views`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
            <CardDescription>Most viewed categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.tools} tools
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{category.views.toLocaleString("en-US")}</p>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <ArrowUpRight className="h-3 w-3" />
                        +{category.growth}%
                      </div>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-chart-5 to-chart-3"
                      style={{ width: `${(category.views / 12450) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{source.source}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{source.visits.toLocaleString("en-US")}</p>
                      <p className="text-xs text-muted-foreground">{source.percentage}%</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total Visits</span>
                <span className="font-bold">
                  {trafficSources.reduce((acc, s) => acc + s.visits, 0).toLocaleString("en-US")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base font-semibold">
                    {activity.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement Metrics</CardTitle>
          <CardDescription>How users interact with your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Avg. Session Duration</p>
              </div>
              <p className="text-3xl font-bold">4m 32s</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+8.2% vs last period</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Pages Per Session</p>
              </div>
              <p className="text-3xl font-bold">5.7</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12.5% vs last period</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
              </div>
              <p className="text-3xl font-bold">28.3%</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowDownRight className="h-3 w-3" />
                <span>-3.1% vs last period</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Notice */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Advanced Analytics</p>
                <p className="text-sm text-muted-foreground">
                  Export detailed reports or integrate with Google Analytics for deeper insights
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}