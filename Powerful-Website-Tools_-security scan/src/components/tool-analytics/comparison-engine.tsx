"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { 
  GitCompare, 
  Search, 
  X, 
  Loader2, 
  Crown, 
  BarChart3, 
  Radar as RadarIcon,
  Table as TableIcon,
  GripVertical,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Image from "next/image";

type Tool = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  category: string;
  pricing: string;
  spiderMetrics?: {
    contentQuality: number;
    speedEfficiency: number;
    creativeFeatures: number;
    integrationOptions: number;
    learningCurve: number;
    valueForMoney: number;
  };
};

interface ComparisonEngineProps {
  currentTool: Tool;
  trigger?: React.ReactNode;
}

const TOOL_COLORS = [
  { stroke: "#6366f1", fill: "#6366f1" },
  { stroke: "#10b981", fill: "#10b981" },
  { stroke: "#f59e0b", fill: "#f59e0b" },
];

const MAX_TOOLS = 3;

export function ComparisonEngine({ currentTool, trigger }: ComparisonEngineProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedTools, setSelectedTools] = React.useState<Tool[]>([currentTool]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [availableTools, setAvailableTools] = React.useState<Tool[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [chartView, setChartView] = React.useState<"spider" | "bar" | "table">("spider");
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [championIndex, setChampionIndex] = React.useState(0);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  React.useEffect(() => {
    if (open && availableTools.length === 0) {
      fetchTools();
    }
  }, [open]);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/tools", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        const tools = data.tools?.filter((t: Tool) => t.id !== currentTool.id) || [];
        
        const toolsWithMetrics = await Promise.all(
          tools.map(async (tool: Tool) => {
            try {
              const metricsRes = await fetch(`/api/aggregated-scores/${tool.id}`);
              if (metricsRes.ok) {
                const metricsData = await metricsRes.json();
                return {
                  ...tool,
                  spiderMetrics: {
                    contentQuality: metricsData.scores?.contentQuality || 5,
                    speedEfficiency: metricsData.scores?.speedEfficiency || 5,
                    creativeFeatures: metricsData.scores?.creativeFeatures || 5,
                    integrationOptions: metricsData.scores?.integrationOptions || 5,
                    learningCurve: metricsData.scores?.learningCurve || 5,
                    valueForMoney: metricsData.scores?.valueForMoney || 5,
                  }
                };
              }
            } catch (err) {
              console.error(`Failed to fetch metrics for tool ${tool.id}`);
            }
            return tool;
          })
        );
        
        setAvailableTools(toolsWithMetrics);
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
      toast.error("Failed to load tools");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTool = (tool: Tool) => {
    if (selectedTools.find((t) => t.id === tool.id)) {
      setSelectedTools(selectedTools.filter((t) => t.id !== tool.id));
    } else {
      if (selectedTools.length >= MAX_TOOLS) {
        toast.error(`Maximum ${MAX_TOOLS} tools can be compared at once`);
        return;
      }
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const removeTool = (toolId: number) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTools = [...selectedTools];
    const draggedTool = newTools[draggedIndex];
    newTools.splice(draggedIndex, 1);
    newTools.splice(index, 0, draggedTool);
    
    setSelectedTools(newTools);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Group tools by category
  const toolsByCategory = React.useMemo(() => {
    const grouped: Record<string, Tool[]> = {};
    availableTools.forEach((tool) => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push(tool);
    });
    return grouped;
  }, [availableTools]);

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return toolsByCategory;
    
    const filtered: Record<string, Tool[]> = {};
    Object.entries(toolsByCategory).forEach(([category, tools]) => {
      const matchingTools = tools.filter((tool) =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingTools.length > 0) {
        filtered[category] = matchingTools;
      }
    });
    return filtered;
  }, [toolsByCategory, searchQuery]);

  // Transform data for charts
  const chartData = React.useMemo(() => {
    if (selectedTools.length === 0 || !selectedTools[0].spiderMetrics) return [];

    const metrics = [
      { key: "contentQuality", label: "Content Quality" },
      { key: "speedEfficiency", label: "Speed" },
      { key: "creativeFeatures", label: "Features" },
      { key: "integrationOptions", label: "Integration" },
      { key: "learningCurve", label: "Learning Curve" },
      { key: "valueForMoney", label: "Value" },
    ];

    return metrics.map((metric) => {
      const dataPoint: any = {
        metric: metric.label,
        metricKey: metric.key,
        fullMark: 10,
      };

      selectedTools.forEach((tool, index) => {
        if (tool.spiderMetrics) {
          dataPoint[`tool${index}`] = tool.spiderMetrics[metric.key as keyof typeof tool.spiderMetrics] || 0;
        }
      });

      return dataPoint;
    });
  }, [selectedTools]);

  const barChartData = React.useMemo(() => {
    return chartData.map((item) => {
      const values = selectedTools.map((_, index) => item[`tool${index}`] || 0);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { ...item, average: avg };
    }).sort((a, b) => b.average - a.average);
  }, [chartData, selectedTools]);

  // Category champions
  const categoryChampions = React.useMemo(() => {
    if (selectedTools.length === 0 || !selectedTools[0].spiderMetrics) return [];

    const metrics = [
      { key: "contentQuality", label: "Content Quality" },
      { key: "speedEfficiency", label: "Speed/Efficiency" },
      { key: "creativeFeatures", label: "Creative Features" },
      { key: "integrationOptions", label: "Integration Options" },
      { key: "learningCurve", label: "Learning Curve" },
      { key: "valueForMoney", label: "Value for Money" },
    ];

    return metrics.map(({ key, label }) => {
      let maxValue = 0;
      let winners: number[] = [];

      selectedTools.forEach((tool) => {
        if (!tool.spiderMetrics) return;
        const value = tool.spiderMetrics[key as keyof typeof tool.spiderMetrics];
        if (value > maxValue) {
          maxValue = value;
          winners = [tool.id];
        } else if (value === maxValue) {
          winners.push(tool.id);
        }
      });

      return { key, label, winners, maxValue };
    });
  }, [selectedTools]);

  // Table sorting
  const sortedTableData = React.useMemo(() => {
    if (!sortColumn) return chartData;

    return [...chartData].sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      if (sortColumn === "metric") {
        return sortDirection === "asc" 
          ? a.metric.localeCompare(b.metric)
          : b.metric.localeCompare(a.metric);
      }

      const toolIndex = parseInt(sortColumn.replace("tool", ""));
      aVal = a[`tool${toolIndex}`] || 0;
      bVal = b[`tool${toolIndex}`] || 0;

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [chartData, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3">
          <p className="font-semibold mb-2 text-sm">{payload[0].payload.metric}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              if (entry.dataKey.startsWith("tool")) {
                const toolIndex = parseInt(entry.dataKey.replace("tool", ""));
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.stroke }}
                    />
                    <span className="text-xs font-medium">
                      {selectedTools[toolIndex]?.title}: {entry.value.toFixed(1)}/10
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <GitCompare className="h-4 w-4" />
            Compare Tools
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-[98vw] max-h-[98vh] min-w-[1200px] min-h-[800px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-background to-secondary/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GitCompare className="h-6 w-6 text-primary" />
            Tool Comparison Engine
          </DialogTitle>
        </DialogHeader>

        {/* Selected Tools Horizontal Pill Bar */}
        <div className="px-6 py-4 border-b bg-secondary/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">
              Selected Tools ({selectedTools.length}/{MAX_TOOLS})
            </span>
            {selectedTools.length >= 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTools([currentTool])}
                className="h-7 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap min-h-[44px]">
            {selectedTools.map((tool, index) => (
              <div
                key={tool.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="group flex items-center gap-2 px-3 py-2 bg-card border-2 rounded-full shadow-sm hover:shadow-md transition-all cursor-move"
                style={{ borderColor: TOOL_COLORS[index].stroke }}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: TOOL_COLORS[index].stroke }}
                />
                {tool.image && (
                  <div className="relative h-6 w-6 shrink-0">
                    <Image
                      src={tool.image}
                      alt={tool.title}
                      fill
                      className="rounded object-cover"
                      sizes="24px"
                    />
                  </div>
                )}
                <span className="font-medium text-sm">{tool.title}</span>
                <button
                  onClick={() => removeTool(tool.id)}
                  className="ml-1 p-1 hover:bg-destructive/20 rounded-full transition-colors"
                  aria-label={`Remove ${tool.title}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {selectedTools.length < MAX_TOOLS && (
              <Badge variant="outline" className="gap-1.5 py-2">
                <Sparkles className="h-3 w-3" />
                Select {MAX_TOOLS - selectedTools.length} more to compare
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[300px_1fr_280px] h-[calc(98vh-180px)] relative">
          {/* Left Sidebar - Tool Selection with Categories */}
          <div className="border-r flex flex-col bg-secondary/10 overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Accordion type="multiple" className="w-full" defaultValue={Object.keys(filteredCategories).slice(0, 3)}>
                  {Object.entries(filteredCategories).map(([category, tools]) => (
                    <AccordionItem key={category} value={category} className="border-b">
                      <AccordionTrigger className="px-4 py-3 hover:bg-secondary/50 text-sm font-semibold">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span>{category}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {tools.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2">
                        <div className="space-y-1">
                          {tools.slice(0, 6).map((tool) => (
                            <div
                              key={tool.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                selectedTools.find((t) => t.id === tool.id)
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : "border-transparent hover:bg-secondary/50"
                              }`}
                              onClick={() => toggleTool(tool)}
                            >
                              <Checkbox
                                checked={!!selectedTools.find((t) => t.id === tool.id)}
                                className="shrink-0"
                              />
                              {tool.image && (
                                <div className="relative h-8 w-8 shrink-0">
                                  <Image
                                    src={tool.image}
                                    alt={tool.title}
                                    fill
                                    className="rounded object-cover"
                                    sizes="32px"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{tool.title}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{tool.pricing}</p>
                              </div>
                            </div>
                          ))}
                          {tools.length > 6 && (
                            <div className="text-center py-2">
                              <Badge variant="outline" className="text-xs">
                                +{tools.length - 6} more
                              </Badge>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col overflow-hidden">
            {selectedTools.length < 2 ? (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
                <div className="text-center">
                  <GitCompare className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-2">Start Comparing</h3>
                  <p className="text-muted-foreground">
                    Select at least 2 tools from the sidebar to see their performance comparison
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-8 space-y-8">
                  {/* Chart Card */}
                  {selectedTools.every(tool => tool.spiderMetrics) && (
                    <Card className="p-8 shadow-lg border-2 relative overflow-visible">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold">Performance Comparison</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Analyzing {selectedTools.length} tools across 6 key metrics
                          </p>
                        </div>
                        <Tabs value={chartView} onValueChange={(v) => setChartView(v as any)}>
                          <TabsList className="grid grid-cols-3 w-[280px]">
                            <TabsTrigger value="spider" className="gap-1.5">
                              <RadarIcon className="h-3.5 w-3.5" />
                              Spider
                            </TabsTrigger>
                            <TabsTrigger value="bar" className="gap-1.5">
                              <BarChart3 className="h-3.5 w-3.5" />
                              Bar
                            </TabsTrigger>
                            <TabsTrigger value="table" className="gap-1.5">
                              <TableIcon className="h-3.5 w-3.5" />
                              Table
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      
                      {chartView === "spider" && (
                        <div className="w-full p-8" style={{ height: "700px", aspectRatio: "1.5/1" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={chartData}>
                              <PolarGrid 
                                stroke="hsl(var(--border))" 
                                strokeWidth={1.5}
                              />
                              <PolarAngleAxis
                                dataKey="metric"
                                tick={({ payload, x, y, textAnchor }) => (
                                  <g transform={`translate(${x},${y})`}>
                                    <text
                                      x={0}
                                      y={0}
                                      dy={4}
                                      textAnchor={textAnchor}
                                      fill="hsl(var(--foreground))"
                                      fontSize={14}
                                      fontWeight={700}
                                    >
                                      {payload.value}
                                    </text>
                                  </g>
                                )}
                              />
                              <PolarRadiusAxis
                                angle={90}
                                domain={[0, 10]}
                                tick={{ fontSize: 12, fontWeight: 600 }}
                                tickCount={6}
                              />
                              
                              {selectedTools.map((tool, index) => (
                                <Radar
                                  key={tool.id}
                                  name={tool.title}
                                  dataKey={`tool${index}`}
                                  stroke={TOOL_COLORS[index].stroke}
                                  fill="transparent"
                                  strokeWidth={3}
                                  strokeDasharray="5 5"
                                  dot={{ r: 5, fill: TOOL_COLORS[index].stroke, strokeWidth: 2, stroke: "white" }}
                                />
                              ))}
                              
                              <Tooltip content={<CustomTooltip />} />
                              <Legend 
                                wrapperStyle={{ paddingTop: "20px" }}
                                iconType="line"
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {chartView === "bar" && (
                        <div className="w-full p-8" style={{ height: "700px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} layout="horizontal">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis type="number" domain={[0, 10]} />
                              <YAxis 
                                type="category" 
                                dataKey="metric" 
                                width={140}
                                tick={{ fontSize: 13, fontWeight: 600 }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              {selectedTools.map((tool, index) => (
                                <Bar 
                                  key={tool.id}
                                  dataKey={`tool${index}`}
                                  name={tool.title}
                                  fill={TOOL_COLORS[index].fill}
                                  radius={[0, 6, 6, 0]}
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {chartView === "table" && (
                        <div className="overflow-x-auto p-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2">
                                <th 
                                  className="text-left p-4 text-sm font-bold cursor-pointer hover:bg-secondary/50 transition-colors"
                                  onClick={() => handleSort("metric")}
                                >
                                  <div className="flex items-center gap-2">
                                    Metric
                                    {sortColumn === "metric" && (
                                      sortDirection === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                                    )}
                                  </div>
                                </th>
                                {selectedTools.map((tool, index) => (
                                  <th 
                                    key={tool.id} 
                                    className="text-center p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                                    onClick={() => handleSort(`tool${index}`)}
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: TOOL_COLORS[index].stroke }}
                                      />
                                      <span className="text-sm font-bold">{tool.title}</span>
                                      {sortColumn === `tool${index}` && (
                                        sortDirection === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                                      )}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {sortedTableData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-secondary/30 transition-colors">
                                  <td className="p-4 font-semibold text-sm">{row.metric}</td>
                                  {selectedTools.map((tool, toolIndex) => {
                                    const value = row[`tool${toolIndex}`] || 0;
                                    return (
                                      <td key={tool.id} className="text-center p-4">
                                        <Badge 
                                          variant="outline"
                                          className="font-bold text-sm px-3 py-1"
                                          style={{ 
                                            backgroundColor: `${TOOL_COLORS[toolIndex].stroke}15`,
                                            borderColor: TOOL_COLORS[toolIndex].stroke 
                                          }}
                                        >
                                          {value.toFixed(1)}/10
                                        </Badge>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Comparison Details Table - Now Expandable */}
                  <Card className="shadow-lg relative">
                    <div className="p-6 border-b flex items-center justify-between">
                      <h3 className="font-bold text-lg">Tool Details</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const detailsEl = document.getElementById('tool-details-table');
                          if (detailsEl) {
                            if (detailsEl.style.maxHeight === 'none') {
                              detailsEl.style.maxHeight = '300px';
                            } else {
                              detailsEl.style.maxHeight = 'none';
                            }
                          }
                        }}
                        className="gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Expand Full View
                      </Button>
                    </div>
                    <div 
                      id="tool-details-table"
                      className="overflow-y-auto transition-all duration-300"
                      style={{ maxHeight: "300px" }}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2">
                              <th className="text-left p-3 text-sm font-bold">Property</th>
                              {selectedTools.map((tool, index) => (
                                <th key={tool.id} className="text-center p-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: TOOL_COLORS[index].stroke }}
                                    />
                                    <span className="text-sm font-bold">{tool.title}</span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            <tr className="hover:bg-secondary/20">
                              <td className="p-3 text-sm font-medium">Category</td>
                              {selectedTools.map((tool) => (
                                <td key={tool.id} className="text-center p-3">
                                  <Badge variant="secondary">{tool.category}</Badge>
                                </td>
                              ))}
                            </tr>
                            <tr className="hover:bg-secondary/20">
                              <td className="p-3 text-sm font-medium">Pricing</td>
                              {selectedTools.map((tool) => (
                                <td key={tool.id} className="text-center p-3">
                                  <Badge variant="outline" className="capitalize">
                                    {tool.pricing}
                                  </Badge>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Right Sidebar - Category Champions Carousel */}
          {selectedTools.length >= 2 && selectedTools.every(tool => tool.spiderMetrics) && (
            <div className="border-l flex flex-col bg-gradient-to-b from-secondary/20 to-background sticky top-0 h-full overflow-hidden">
              <div className="p-4 border-b shrink-0">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Category Champions
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Top performers by metric
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {categoryChampions.map(({ key, label, winners, maxValue }) => (
                    <Card key={key} className="p-4 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-semibold">{label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {maxValue.toFixed(1)}/10
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {winners.map((winnerId) => {
                          const winner = selectedTools.find((t) => t.id === winnerId);
                          const winnerIndex = selectedTools.findIndex((t) => t.id === winnerId);
                          return winner ? (
                            <Badge 
                              key={winnerId}
                              className="gap-1.5 shadow-sm"
                              style={{
                                backgroundColor: TOOL_COLORS[winnerIndex].stroke,
                                color: "white"
                              }}
                            >
                              <Crown className="h-3 w-3" />
                              {winner.title}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Responsive Media Query Styles */}
        <style jsx>{`
          @media (max-width: 768px) {
            .grid {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto 1fr auto;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}