"use client";

import * as React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Shield } from "lucide-react";
import { toast } from "sonner";

interface SpiderChartProps {
  toolId: number;
  toolCategory: string;
  height?: number;
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

export function SpiderChart({ toolId, toolCategory, height = 360 }: SpiderChartProps) {
  const [loading, setLoading] = React.useState(true);
  const [criteria, setCriteria] = React.useState<GenreCriterion[]>([]);
  const [aggregatedData, setAggregatedData] = React.useState<AggregatedScore | null>(null);
  const [editorialData, setEditorialData] = React.useState<EditorialScore | null>(null);
  const [dataSource, setDataSource] = React.useState<DataSource>("default");
  const [fallbackReason, setFallbackReason] = React.useState<string>("");

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
          // Parse metricScores if it's a string
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

  // Transform data for recharts
  const chartData = React.useMemo(() => {
    if (criteria.length === 0) return [];

    return criteria.map((criterion) => {
      let value = 5; // Default middle value

      if (dataSource === "aggregated" && aggregatedData) {
        const metric = aggregatedData.metricScores[criterion.metricKey];
        value = metric ? metric.avg : 5;
      } else if (dataSource === "editorial" && editorialData) {
        value = editorialData.metricScores[criterion.metricKey] || 5;
      }

      return {
        metric: criterion.metricLabel,
        value: value,
        fullMark: 10,
      };
    });
  }, [criteria, aggregatedData, editorialData, dataSource]);

  // Calculate average score
  const averageScore = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.value, 0);
    return sum / chartData.length;
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3">
          <p className="font-semibold mb-2 text-sm">{data.metric}</p>
          <Badge variant="secondary" className="text-xs h-6 px-2 font-bold">
            {data.value.toFixed(1)}/10
          </Badge>
        </div>
      );
    }
    return null;
  };

  // Gradient colors
  const gradientColors = { id: "gradient1", start: "#8b5cf6", end: "#6366f1" };

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
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background to-muted/30">
      <CardContent className="p-6">
        {/* Header with Data Source Indicator */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Performance Analytics</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on {criteria.length} key metrics
            </p>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
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
                {aggregatedData.confidenceScore >= 30 && aggregatedData.confidenceScore < 70 && (
                  <Badge variant="outline" className="gap-1.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                    <TrendingUp className="h-3 w-3" />
                    Moderate Confidence
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

        {/* Radar Chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={chartData}>
              <PolarGrid 
                stroke="hsl(var(--border))" 
                strokeWidth={1}
                strokeOpacity={0.3}
              />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ 
                  fill: "hsl(var(--muted-foreground))", 
                  fontSize: 12, 
                  fontWeight: 600 
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
        </div>

        {/* Average Score Badge */}
        <div className="flex justify-center mt-4 gap-3">
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
        </div>
      </CardContent>
    </Card>
  );
}