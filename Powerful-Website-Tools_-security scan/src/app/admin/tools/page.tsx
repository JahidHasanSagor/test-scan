"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Star,
  StarOff,
  Loader2,
  Search,
  Trash2,
  Eye,
  Sparkles,
  List,
  Grid3x3,
  Table as TableIcon,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

type Tool = {
  id: number;
  title: string;
  description: string;
  category: string;
  pricing: string;
  type: string;
  status: string;
  isFeatured: boolean;
  isToolOfTheWeek: boolean;
  submittedByUserId: string | null;
  createdAt: string;
  viewCount: number;
};

type Stats = {
  totalTools: number;
  pendingTools: number;
  approvedTools: number;
  rejectedTools: number;
};

const categories = [
  "All Categories",
  "AI Writing",
  "Image Generation",
  "Video Tools",
  "Code Assistants",
  "Audio Tools",
  "Research",
  "Productivity",
  "Marketing",
];

const pricingOptions = [
  "All Pricing",
  "Free",
  "Freemium",
  "Paid",
  "Free Trial",
];

export default function AdminToolsPage() {
  const [tools, setTools] = React.useState<Tool[]>([]);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<number | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("All Categories");
  const [sortBy, setSortBy] = React.useState("newest");
  const [viewMode, setViewMode] = React.useState<"list" | "grid" | "table">("table");
  const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  // Selection
  const [selectedTools, setSelectedTools] = React.useState<number[]>([]);
  const [expandedRows, setExpandedRows] = React.useState<number[]>([]);

  React.useEffect(() => {
    fetchTools();
    fetchStats();
  }, []);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tools?status=all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTools(data.tools || []);
      }
    } catch (error) {
      console.error("Failed to fetch tools:", error);
      toast.error("Failed to load tools");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
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
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleApprove = async (toolId: number) => {
    setActionLoading(toolId);
    try {
      const res = await fetch(`/api/tools/${toolId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        toast.success("Tool approved successfully");
        fetchTools();
        fetchStats();
      } else {
        toast.error("Failed to approve tool");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (toolId: number) => {
    setActionLoading(toolId);
    try {
      const res = await fetch(`/api/tools/${toolId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        toast.success("Tool rejected");
        fetchTools();
        fetchStats();
      } else {
        toast.error("Failed to reject tool");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (toolId: number) => {
    setActionLoading(toolId);
    try {
      const res = await fetch(`/api/tools/${toolId}/feature?id=${toolId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.featuredStatus ? "Tool featured" : "Tool unfeatured");
        fetchTools();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update featured status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetToolOfWeek = async (toolId: number) => {
    setActionLoading(toolId);
    try {
      const res = await fetch(`/api/tools/${toolId}/tool-of-week`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        toast.success("Set as Tool of the Week");
        fetchTools();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to set Tool of the Week");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (toolId: number) => {
    if (!confirm("Are you sure you want to delete this tool?")) {
      return;
    }

    setActionLoading(toolId);
    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        toast.success("Tool deleted successfully");
        fetchTools();
        fetchStats();
      } else {
        toast.error("Failed to delete tool");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTools.length === 0) return;
    
    try {
      await Promise.all(selectedTools.map(id => handleApprove(id)));
      setSelectedTools([]);
      toast.success(`${selectedTools.length} tools approved`);
    } catch (error) {
      toast.error("Failed to approve some tools");
    }
  };

  const handleBulkReject = async () => {
    if (selectedTools.length === 0) return;
    
    if (!confirm(`Reject ${selectedTools.length} selected tools?`)) {
      return;
    }

    try {
      await Promise.all(selectedTools.map(id => handleReject(id)));
      setSelectedTools([]);
      toast.success(`${selectedTools.length} tools rejected`);
    } catch (error) {
      toast.error("Failed to reject some tools");
    }
  };

  const handleBulkFeature = async () => {
    if (selectedTools.length === 0) return;
    
    const approvedTools = selectedTools.filter(id => {
      const tool = tools.find(t => t.id === id);
      return tool && tool.status === "approved";
    });

    if (approvedTools.length === 0) {
      toast.error("Only approved tools can be featured");
      return;
    }

    try {
      const results = await Promise.all(
        approvedTools.map(async (id) => {
          const tool = tools.find(t => t.id === id);
          if (!tool?.isFeatured) {
            const res = await fetch(`/api/tools/${id}/feature?id=${id}`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
              },
            });
            return res.ok;
          }
          return true;
        })
      );
      
      setSelectedTools([]);
      fetchTools();
      toast.success(`${approvedTools.length} tools featured`);
    } catch (error) {
      toast.error("Failed to feature some tools");
    }
  };

  const handleBulkUnfeature = async () => {
    if (selectedTools.length === 0) return;
    
    const featuredTools = selectedTools.filter(id => {
      const tool = tools.find(t => t.id === id);
      return tool && tool.isFeatured;
    });

    if (featuredTools.length === 0) {
      toast.error("No featured tools selected");
      return;
    }

    try {
      await Promise.all(
        featuredTools.map(async (id) => {
          const res = await fetch(`/api/tools/${id}/feature?id=${id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
            },
          });
          return res.ok;
        })
      );
      
      setSelectedTools([]);
      fetchTools();
      toast.success(`${featuredTools.length} tools unfeatured`);
    } catch (error) {
      toast.error("Failed to unfeature some tools");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTools.length === 0) return;
    
    if (!confirm(`Delete ${selectedTools.length} selected tools?`)) {
      return;
    }

    try {
      await Promise.all(selectedTools.map(id => handleDelete(id)));
      setSelectedTools([]);
      toast.success(`${selectedTools.length} tools deleted`);
    } catch (error) {
      toast.error("Failed to delete some tools");
    }
  };

  const toggleToolSelection = (toolId: number) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTools.length === filteredTools.length) {
      setSelectedTools([]);
    } else {
      setSelectedTools(filteredTools.map(t => t.id));
    }
  };

  const toggleRowExpansion = (toolId: number) => {
    setExpandedRows(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  // Apply filters
  const filteredTools = React.useMemo(() => {
    let filtered = [...tools];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "All Categories") {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(t => {
        const toolDate = new Date(t.createdAt);
        if (dateRange.to) {
          return toolDate >= dateRange.from! && toolDate <= dateRange.to;
        }
        return toolDate >= dateRange.from!;
      });
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "views" || sortBy === "popularity") {
      filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [tools, searchQuery, statusFilter, categoryFilter, sortBy, dateRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Tools Command Center</h1>
        <p className="text-muted-foreground mt-2">
          Review, approve, and manage all tool submissions. Click on any row to expand and see detailed actions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTools || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats?.pendingTools || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approvedTools || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.rejectedTools || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Top row - Search with button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tools by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Search is already reactive, just focus out
                      e.currentTarget.blur();
                    }
                  }}
                />
              </div>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => {
                  if (!searchQuery.trim()) {
                    toast.info("Please enter a search term");
                  }
                }}
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {/* Bottom row - Filters and View Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                  />
                  <div className="p-3 border-t flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Top Performing</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                </SelectContent>
              </Select>

              {/* Spacer */}
              <div className="flex-1" />

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-x"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none"
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm font-medium">
                  {selectedTools.length} tool{selectedTools.length > 1 ? "s" : ""} selected
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleBulkApprove}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkFeature}
                    className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300"
                  >
                    <Star className="h-4 w-4" />
                    Feature All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkUnfeature}
                    className="gap-2"
                  >
                    <StarOff className="h-4 w-4" />
                    Unfeature All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkReject}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDelete}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tools Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredTools.length} Tool{filteredTools.length !== 1 ? "s" : ""}
          </CardTitle>
          <CardDescription>
            {statusFilter === "all" ? "All tools" : `${statusFilter} tools`} • Click any row to expand
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tools found</p>
              {(searchQuery || statusFilter !== "all" || categoryFilter !== "All Categories" || dateRange.from) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCategoryFilter("All Categories");
                    setDateRange({ from: undefined, to: undefined });
                  }}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTools.length === filteredTools.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTools.map((tool) => (
                    <React.Fragment key={tool.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleRowExpansion(tool.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedTools.includes(tool.id)}
                            onCheckedChange={() => toggleToolSelection(tool.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows.includes(tool.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p className="font-medium truncate">{tool.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tool.description}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {tool.isToolOfTheWeek && (
                                <Badge variant="default" className="gap-1 text-xs">
                                  <Sparkles className="h-3 w-3 fill-current" />
                                  ToW
                                </Badge>
                              )}
                              {tool.isFeatured && (
                                <Badge variant="secondary" className="gap-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                  <Star className="h-3 w-3 fill-current" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tool.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tool.status === "approved"
                                ? "default"
                                : tool.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {tool.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{tool.pricing}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tool.viewCount || 0}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(tool.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Row Content */}
                      <AnimatePresence>
                        {expandedRows.includes(tool.id) && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/30 p-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-6 space-y-6">
                                  {/* Tool Details */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Tool Information</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <span className="text-sm font-medium">Title:</span>
                                          <p className="text-sm text-muted-foreground">{tool.title}</p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Description:</span>
                                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Category:</span>
                                          <p className="text-sm text-muted-foreground">{tool.category}</p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Type:</span>
                                          <p className="text-sm text-muted-foreground">{tool.type || "Not specified"}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Statistics & Status</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <span className="text-sm font-medium">Status:</span>
                                          <div className="mt-1">
                                            <Badge
                                              variant={
                                                tool.status === "approved"
                                                  ? "default"
                                                  : tool.status === "pending"
                                                  ? "secondary"
                                                  : "destructive"
                                              }
                                            >
                                              {tool.status}
                                            </Badge>
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Pricing:</span>
                                          <p className="text-sm text-muted-foreground">{tool.pricing}</p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">View Count:</span>
                                          <p className="text-sm text-muted-foreground">{tool.viewCount || 0} views</p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Submitted:</span>
                                          <p className="text-sm text-muted-foreground">
                                            {new Date(tool.createdAt).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Special Tags:</span>
                                          <div className="flex gap-2 mt-1">
                                            {tool.isToolOfTheWeek && (
                                              <Badge variant="default" className="gap-1">
                                                <Sparkles className="h-3 w-3 fill-current" />
                                                Tool of the Week
                                              </Badge>
                                            )}
                                            {tool.isFeatured && (
                                              <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                                <Star className="h-3 w-3 fill-current" />
                                                Featured
                                              </Badge>
                                            )}
                                            {!tool.isToolOfTheWeek && !tool.isFeatured && (
                                              <span className="text-sm text-muted-foreground">None</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {/* View Tool */}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(`/tool/${tool.id}`, "_blank");
                                        }}
                                        className="gap-2"
                                      >
                                        <Eye className="h-4 w-4" />
                                        View Tool Page
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>

                                      {/* Pending Actions */}
                                      {tool.status === "pending" && (
                                        <>
                                          <Button
                                            variant="default"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApprove(tool.id);
                                            }}
                                            disabled={actionLoading === tool.id}
                                            className="gap-2 bg-green-600 hover:bg-green-700"
                                          >
                                            {actionLoading === tool.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <CheckCircle className="h-4 w-4" />
                                            )}
                                            Approve Tool
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleReject(tool.id);
                                            }}
                                            disabled={actionLoading === tool.id}
                                            className="gap-2"
                                          >
                                            {actionLoading === tool.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <XCircle className="h-4 w-4" />
                                            )}
                                            Reject Tool
                                          </Button>
                                        </>
                                      )}

                                      {/* Approved Actions */}
                                      {tool.status === "approved" && (
                                        <>
                                          {!tool.isToolOfTheWeek && (
                                            <Button
                                              variant="default"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetToolOfWeek(tool.id);
                                              }}
                                              disabled={actionLoading === tool.id}
                                              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                            >
                                              {actionLoading === tool.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Sparkles className="h-4 w-4" />
                                              )}
                                              Set as Tool of the Week
                                            </Button>
                                          )}
                                          <Button
                                            variant={tool.isFeatured ? "secondary" : "default"}
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleFeatured(tool.id);
                                            }}
                                            disabled={actionLoading === tool.id}
                                            className="gap-2"
                                          >
                                            {actionLoading === tool.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : tool.isFeatured ? (
                                              <StarOff className="h-4 w-4" />
                                            ) : (
                                              <Star className="h-4 w-4" />
                                            )}
                                            {tool.isFeatured ? "Remove from Featured" : "Add to Featured"}
                                          </Button>
                                        </>
                                      )}

                                      {/* Delete Action */}
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(tool.id);
                                        }}
                                        disabled={actionLoading === tool.id}
                                        className="gap-2"
                                      >
                                        {actionLoading === tool.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                        Delete Tool
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </TableCell>
                          </TableRow>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}