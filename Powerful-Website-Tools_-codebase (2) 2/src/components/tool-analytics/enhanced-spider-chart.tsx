"use client";

import * as React from "react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  TrendingUp, 
  Users, 
  Shield, 
  Maximize2,
  BarChart3,
  Radar as RadarIcon,
  Smartphone,
  Monitor,
  Zap,
  Star,
  Target,
  Gauge,
  DollarSign,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EnhancedSpiderChartProps {
  toolId: number;
  toolCategory: string;
  height?: number;
  defaultView?: "spider" | "bar";
  showToggle?: boolean;
  showExpand?: boolean;
}

interface MetricData {
  avg: number;
  count: number;
  stdDev: number;
  min: number;
  max: number;
}

interface AggregatedScore {
  metricScores: Record<string, MetricData>;
  overallAverage: number;
  totalReviews: number;
  verifiedReviews: number;
  editorialReviews: number;
  confidenceScore: number;
}

interface EditorialScore {
  metricScores: Record<string, number>;
  editor: {
    name: string;
  };
}

interface GenreCriterion {
  metricKey: string;
  metricLabel: string;
  metricIcon: string | null;
  metricColor: string | null;
}

type DataSource = "aggregated" | "editorial" | "default";
type ViewMode = "spider" | "bar";

// Icon mapping for metrics
const METRIC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  contentQuality: Star,
  speedEfficiency: Zap,
  creativeFeatures: Target,
  integrationOptions: Smartphone,
  learningCurve: GraduationCap,
  valueForMoney: DollarSign,
  performance: Gauge,
  features: Star,
  ease: GraduationCap,
  pricing: DollarSign,
  support: Users,
  reliability: Shield,
};

// Get icon for metric
function getMetricIcon(metricKey: string): React.ComponentType<{ className?: string }> {
  const normalizedKey = metricKey.toLowerCase().replace(/[^a-z]/g, '');
  
  for (const [key, Icon] of Object.entries(METRIC_ICONS)) {
    if (normalizedKey.includes(key.toLowerCase())) {
      return Icon;
    }
  }
  
  return Target; // Default icon
}

// Get color for score
function getScoreColor(score: number): string {
  if (score >= 8) return "hsl(142, 76%, 36%)"; // Green
  if (score >= 6) return "hsl(45, 93%, 47%)"; // Yellow
  return "hsl(0, 84%, 60%)"; // Red
}

export function EnhancedSpiderChart({ 
  toolId, 
  toolCategory, 
  height = 360,
  defaultView = "spider",
  showToggle = true,
  showExpand = true
}: EnhancedSpiderChartProps) {
  const [loading, setLoading] = React.useState(true);
  const [criteria, setCriteria] = React.useState<GenreCriterion[]>([]);
  const [aggregatedData, setAggregatedData] = React.useState<AggregatedScore | null>(null);
  const [editorialData, setEditorialData] = React.useState<EditorialScore | null>(null);
  const [dataSource, setDataSource] = React.useState<DataSource>("default");
  const [fallbackReason, setFallbackReason] = React.useState<string>("");
  const [viewMode, setViewMode] = React.useState<ViewMode>(defaultView);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-switch to bar chart on mobile
      if (mobile && viewMode === "spider") {
        setViewMode("bar");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [viewMode]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch genre criteria
        const criteriaResponse = await fetch(`/api/genre-criteria/${encodeURIComponent(toolCategory)}`);
        if (!criteriaResponse.ok) throw new Error("Failed to fetch criteria");
        const criteriaData = await criteriaResponse.json();
        setCriteria(criteriaData);

        // Fetch aggregated scores with fallback logic
        const scoresResponse = await fetch(`/api/aggregated-scores/${toolId}`);
        if (!scoresResponse.ok) throw new Error("Failed to fetch scores");
        const scoresData = await scoresResponse.json();

        if (scoresData.aggregated) {
          const parsedAggregated = {
            ...scoresData.aggregated,
            metricScores: typeof scoresData.aggregated.metricScores === 'string' 
              ? JSON.parse(scoresData.aggregated.metricScores)
              : scoresData.aggregated.metricScores
          };
          setAggregatedData(parsedAggregated);
        }

        if (scoresData.editorial) {
          const parsedEditorial = {
            ...scoresData.editorial,
            metricScores: typeof scoresData.editorial.metricScores === 'string'
              ? JSON.parse(scoresData.editorial.metricScores)
              : scoresData.editorial.metricScores
          };
          setEditorialData(parsedEditorial);
        }

        setDataSource(scoresData.recommended);
        setFallbackReason(scoresData.fallbackReason || "");

      } catch (error) {
        console.error("Error fetching spider chart data:", error);
        toast.error("Failed to load performance analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [toolId, toolCategory]);

  // Transform data for charts
  const chartData = React.useMemo(() => {
    if (criteria.length === 0) return [];

    return criteria.map((criterion) => {
      let value = 5; // Default middle value
      let industryAvg = 5; // Mock industry average

      if (dataSource === "aggregated" && aggregatedData) {
        const metric = aggregatedData.metricScores[criterion.metricKey];
        value = metric ? metric.avg : 5;
      } else if (dataSource === "editorial" && editorialData) {
        value = editorialData.metricScores[criterion.metricKey] || 5;
      }

      const Icon = getMetricIcon(criterion.metricKey);

      return {
        metric: criterion.metricLabel,
        metricKey: criterion.metricKey,
        value: value,
        industryAvg: industryAvg,
        fullMark: 10,
        Icon: Icon,
        color: getScoreColor(value),
      };
    });
  }, [criteria, aggregatedData, editorialData, dataSource]);

  // Calculate average score
  const averageScore = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.value, 0);
    return sum / chartData.length;
  }, [chartData]);

  // Sort for bar chart (highest to lowest)
  const sortedChartData = React.useMemo(() => {
    return [...chartData].sort((a, b) => b.value - a.value);
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            {data.Icon && <data.Icon className="h-4 w-4 text-primary" />}
            <p className="font-semibold text-sm">{data.metric}</p>
          </div>
          <div className="space-y-1">
            <Badge variant="secondary" className="text-xs h-6 px-2 font-bold">
              Your Score: {data.value.toFixed(1)}/10
            </Badge>
            <Badge variant="outline" className="text-xs h-6 px-2">
              Industry Avg: {data.industryAvg.toFixed(1)}/10
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  const gradientColors = { id: "gradient1", start: "#8b5cf6", end: "#6366f1" };

  const ChartContent = ({ expanded = false }: { expanded?: boolean }) => {
    const chartHeight = expanded ? 500 : height;
    
    if (viewMode === "spider") {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <RadarChart data={chartData}>
            {/* Grid */}
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeWidth={1}
              strokeOpacity={0.3}
            />
            
            {/* Labels with Icons */}
            <PolarAngleAxis
              dataKey="metric"
              tick={({ payload, x, y, textAnchor, index }) => {
                const data = chartData[index];
                const Icon = data?.Icon || Target;
                
                return (
                  <g transform={`translate(${x},${y})`}>
                    {/* Icon */}
                    <foreignObject
                      x={textAnchor === "middle" ? -8 : textAnchor === "end" ? -20 : 0}
                      y={-20}
                      width={16}
                      height={16}
                    >
                      <div className="flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </foreignObject>
                    {/* Label */}
                    <text
                      x={0}
                      y={0}
                      dy={0}
                      textAnchor={textAnchor}
                      fill="hsl(var(--muted-foreground))"
                      fontSize={12}
                      fontWeight={600}
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
              tickLine={false}
            />
            
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={false}
              tickCount={6}
              axisLine={false}
            />

            {/* Industry Average (dotted line) */}
            <Radar
              name="Industry Average"
              dataKey="industryAvg"
              stroke="hsl(var(--muted-foreground))"
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="5 5"
              opacity={0.6}
            />

            {/* Tool Performance */}
            <Radar
              name="Performance"
              dataKey="value"
              stroke={gradientColors.start}
              fill={`url(#fill-${gradientColors.id})`}
              fillOpacity={0.7}
              strokeWidth={3}
              style={{
                filter: `drop-shadow(0 4px 12px ${gradientColors.start}40)`,
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    // Bar Chart View
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={sortedChartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            type="number" 
            domain={[0, 10]} 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            type="category" 
            dataKey="metric" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            width={120}
            tick={({ payload, x, y, index }) => {
              const data = sortedChartData[index];
              const Icon = data?.Icon || Target;
              
              return (
                <g transform={`translate(${x},${y})`}>
                  {/* Icon */}
                  <foreignObject
                    x={-120}
                    y={-8}
                    width={16}
                    height={16}
                  >
                    <div className="flex items-center">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </foreignObject>
                  {/* Label */}
                  <text
                    x={-100}
                    y={0}
                    dy={4}
                    textAnchor="start"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={11}
                    fontWeight={500}
                  >
                    {payload.value}
                  </text>
                </g>
              );
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {sortedChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
          {/* Industry average line overlay would go here if needed */}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (criteria.length === 0) {
    return (
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            Performance analytics not available for this category
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-6">
          {/* Header with Controls */}
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Performance Analytics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on {criteria.length} key metrics
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              {showToggle && !isMobile && (
                <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
                  <Button
                    variant={viewMode === "spider" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("spider")}
                    className="h-8 px-3"
                  >
                    <RadarIcon className="h-4 w-4 mr-1" />
                    Spider
                  </Button>
                  <Button
                    variant={viewMode === "bar" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("bar")}
                    className="h-8 px-3"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Bar
                  </Button>
                </div>
              )}

              {/* Mobile indicator */}
              {isMobile && (
                <Badge variant="outline" className="gap-1.5">
                  <Smartphone className="h-3 w-3" />
                  Mobile View
                </Badge>
              )}

              {/* Expand Button */}
              {showExpand && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="h-8 px-3"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}

              {/* Data Source Indicators */}
              <div className="flex flex-col gap-1.5">
                {dataSource === "aggregated" && aggregatedData && (
                  <>
                    <Badge variant="default" className="gap-1.5">
                      <Users className="h-3 w-3" />
                      {aggregatedData.totalReviews} Review{aggregatedData.totalReviews !== 1 ? 's' : ''}
                    </Badge>
                    {aggregatedData.confidenceScore >= 70 && (
                      <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                        <Shield className="h-3 w-3" />
                        High Confidence
                      </Badge>
                    )}
                  </>
                )}
                {dataSource === "editorial" && editorialData && (
                  <Badge variant="secondary" className="gap-1.5">
                    Editorial Review
                  </Badge>
                )}
                {dataSource === "default" && (
                  <Badge variant="outline" className="gap-1.5">
                    Default Scores
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Fallback Reason */}
          {fallbackReason && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                {fallbackReason === "Low confidence score" && "Using editorial review due to limited user reviews"}
                {fallbackReason === "No aggregated scores" && "Using editorial review - be the first to submit a review!"}
                {fallbackReason === "No aggregated or editorial scores" && "Default scores shown - submit a review to improve accuracy"}
              </p>
            </div>
          )}

          {/* Gradient Definitions */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id={gradientColors.id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientColors.start} />
                <stop offset="100%" stopColor={gradientColors.end} />
              </linearGradient>
              <linearGradient id={`fill-${gradientColors.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.4} />
                <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </svg>

          {/* Chart */}
          <div className="relative">
            <ChartContent />
          </div>

          {/* Stats Footer */}
          <div className="flex justify-center mt-4 gap-3 flex-wrap">
            <Badge 
              variant="outline" 
              className="text-sm h-8 px-4 font-bold border-2"
              style={{ 
                borderColor: gradientColors.start,
                backgroundColor: `${gradientColors.start}15`
              }}
            >
              Average: {averageScore.toFixed(1)}/10
            </Badge>
            {dataSource === "aggregated" && aggregatedData && (
              <Badge 
                variant="outline" 
                className="text-sm h-8 px-4 font-bold border-2"
              >
                Confidence: {aggregatedData.confidenceScore.toFixed(0)}%
              </Badge>
            )}
            {viewMode === "bar" && (
              <Badge variant="outline" className="gap-1.5">
                <TrendingUp className="h-3 w-3" />
                Sorted by Score
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Performance Analytics - Full View
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Controls in expanded view */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "spider" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("spider")}
                >
                  <RadarIcon className="h-4 w-4 mr-2" />
                  Spider View
                </Button>
                <Button
                  variant={viewMode === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("bar")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Bar View
                </Button>
              </div>

              <Badge 
                variant="outline" 
                className="text-sm h-8 px-4 font-bold"
              >
                Average: {averageScore.toFixed(1)}/10
              </Badge>
            </div>

            {/* Gradient Definitions */}
            <svg width="0" height="0">
              <defs>
                <linearGradient id={`${gradientColors.id}-expanded`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gradientColors.start} />
                  <stop offset="100%" stopColor={gradientColors.end} />
                </linearGradient>
                <linearGradient id={`fill-${gradientColors.id}-expanded`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </svg>

            <ChartContent expanded />

            {/* Detailed Metrics Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Metric</th>
                    <th className="text-center p-3 font-semibold">Score</th>
                    <th className="text-center p-3 font-semibold">Industry Avg</th>
                    <th className="text-center p-3 font-semibold">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {chartData.map((data, index) => {
                    const diff = data.value - data.industryAvg;
                    const Icon = data.Icon;
                    return (
                      <tr key={index} className={index % 2 === 0 ? "bg-secondary/20" : ""}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{data.metric}</span>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <Badge 
                            variant="outline" 
                            className="font-bold"
                            style={{ 
                              backgroundColor: `${data.color}15`,
                              borderColor: data.color
                            }}
                          >
                            {data.value.toFixed(1)}/10
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline">
                            {data.industryAvg.toFixed(1)}/10
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge 
                            variant={diff > 0 ? "default" : diff < 0 ? "destructive" : "outline"}
                            className="gap-1"
                          >
                            {diff > 0 && <TrendingUp className="h-3 w-3" />}
                            {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}