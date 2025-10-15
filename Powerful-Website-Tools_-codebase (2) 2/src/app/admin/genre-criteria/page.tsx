"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical,
  Settings,
  ListTree,
  ChevronDown,
  ChevronUp,
  Save
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import Link from "next/link";

interface GenreCriterion {
  id: number;
  category: string;
  metricKey: string;
  metricLabel: string;
  metricIcon: string | null;
  metricColor: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AVAILABLE_CATEGORIES = [
  "AI Writing",
  "Design",
  "Development",
  "Marketing",
  "E-commerce",
  "Productivity",
  "Video Editing",
  "Audio",
  "Photo Editing",
  "Project Management",
  "Analytics",
  "CRM",
  "API Tool",
  "Automation",
  "Code Editor",
  "Learning",
  "Communication",
  "Security",
  "Finance",
  "Other"
];

const COMMON_COLORS = [
  { label: "Purple", value: "#8b5cf6" },
  { label: "Blue", value: "#2563eb" },
  { label: "Green", value: "#10b981" },
  { label: "Orange", value: "#f59e0b" },
  { label: "Pink", value: "#ec4899" },
  { label: "Red", value: "#ef4444" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Indigo", value: "#6366f1" },
];

export default function GenreCriteriaAdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [criteria, setCriteria] = useState<GenreCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form state for add/edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<GenreCriterion | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    metricKey: "",
    metricLabel: "",
    metricIcon: "",
    metricColor: "#8b5cf6",
    displayOrder: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  // Check authentication and admin role
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/admin/genre-criteria");
      return;
    }

    if (!isPending && session?.user) {
      // Check if user is admin
      const checkAdmin = async () => {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch("/api/admin/stats", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (!response.ok) {
            toast.error("Access denied. Admin privileges required.");
            router.push("/");
          }
        } catch (error) {
          console.error("Error checking admin access:", error);
          router.push("/");
        }
      };

      checkAdmin();
    }
  }, [session, isPending, router]);

  // Fetch all criteria
  const fetchCriteria = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/genre-criteria");
      if (!response.ok) throw new Error("Failed to fetch criteria");
      
      const data = await response.json();
      setCriteria(data);
    } catch (error) {
      console.error("Error fetching criteria:", error);
      toast.error("Failed to load criteria");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCriteria();
    }
  }, [session]);

  // Group criteria by category
  const criteriaByCategory = React.useMemo(() => {
    const grouped = new Map<string, GenreCriterion[]>();
    
    criteria.forEach((criterion) => {
      if (!grouped.has(criterion.category)) {
        grouped.set(criterion.category, []);
      }
      grouped.get(criterion.category)!.push(criterion);
    });

    // Sort criteria within each category by displayOrder
    grouped.forEach((critList) => {
      critList.sort((a, b) => a.displayOrder - b.displayOrder);
    });

    return grouped;
  }, [criteria]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleAddCriterion = () => {
    setEditingCriterion(null);
    setFormData({
      category: selectedCategory || AVAILABLE_CATEGORIES[0],
      metricKey: "",
      metricLabel: "",
      metricIcon: "",
      metricColor: "#8b5cf6",
      displayOrder: 1,
    });
    setDialogOpen(true);
  };

  const handleEditCriterion = (criterion: GenreCriterion) => {
    setEditingCriterion(criterion);
    setFormData({
      category: criterion.category,
      metricKey: criterion.metricKey,
      metricLabel: criterion.metricLabel,
      metricIcon: criterion.metricIcon || "",
      metricColor: criterion.metricColor || "#8b5cf6",
      displayOrder: criterion.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleDeleteCriterion = async (criterion: GenreCriterion) => {
    if (!confirm(`Are you sure you want to delete "${criterion.metricLabel}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/genre-criteria/${criterion.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete criterion");
      }

      toast.success("Criterion deleted successfully");
      await fetchCriteria();
    } catch (error) {
      console.error("Error deleting criterion:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete criterion");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.metricKey || !formData.metricLabel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const url = editingCriterion
        ? `/api/genre-criteria/${editingCriterion.id}`
        : "/api/genre-criteria";
      
      const method = editingCriterion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category: formData.category,
          metricKey: formData.metricKey,
          metricLabel: formData.metricLabel,
          metricIcon: formData.metricIcon || null,
          metricColor: formData.metricColor || null,
          displayOrder: formData.displayOrder,
          isActive: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${editingCriterion ? 'update' : 'create'} criterion`);
      }

      toast.success(`Criterion ${editingCriterion ? 'updated' : 'created'} successfully`);
      setDialogOpen(false);
      await fetchCriteria();
    } catch (error) {
      console.error("Error submitting criterion:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save criterion");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
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

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-chart-5" />
            <h1 className="text-3xl font-bold font-display">Genre Criteria Management</h1>
          </div>
          <p className="text-muted-foreground">
            Configure genre-specific criteria for spider chart analytics across different tool categories.
          </p>
        </div>

        {/* Admin Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/tools">Tools</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">Users</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blog">Blog</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">Analytics</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/admin/genre-criteria">Genre Criteria</Link>
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ListTree className="h-5 w-5 text-chart-3" />
            <span className="text-sm font-medium">
              {criteriaByCategory.size} Categories • {criteria.length} Criteria
            </span>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddCriterion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Criterion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCriterion ? "Edit Criterion" : "Add New Criterion"}
                </DialogTitle>
                <DialogDescription>
                  Configure a performance metric for a specific genre/category.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metricKey">Metric Key * (camelCase, e.g., contentQuality)</Label>
                    <Input
                      id="metricKey"
                      value={formData.metricKey}
                      onChange={(e) => setFormData({ ...formData, metricKey: e.target.value })}
                      placeholder="contentQuality"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metricLabel">Metric Label * (Display name)</Label>
                    <Input
                      id="metricLabel"
                      value={formData.metricLabel}
                      onChange={(e) => setFormData({ ...formData, metricLabel: e.target.value })}
                      placeholder="Content Quality"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metricIcon">Icon (Emoji or symbol)</Label>
                    <Input
                      id="metricIcon"
                      value={formData.metricIcon}
                      onChange={(e) => setFormData({ ...formData, metricIcon: e.target.value })}
                      placeholder="✨"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metricColor">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="metricColor"
                        type="color"
                        value={formData.metricColor}
                        onChange={(e) => setFormData({ ...formData, metricColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Select
                        value={formData.metricColor}
                        onValueChange={(value) => setFormData({ ...formData, metricColor: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_COLORS.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      min="1"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingCriterion ? "Update" : "Create"}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Criteria by Category */}
        <div className="space-y-4">
          {Array.from(criteriaByCategory.entries()).map(([category, critList]) => {
            const isExpanded = expandedCategories.has(category);
            
            return (
              <Card key={category}>
                <CardHeader className="cursor-pointer" onClick={() => toggleCategory(category)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{category}</CardTitle>
                        <CardDescription>{critList.length} criteria configured</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(category);
                        handleAddCriterion();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className="space-y-2">
                      {critList.map((criterion) => (
                        <div
                          key={criterion.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className="font-mono text-xs">
                              {criterion.displayOrder}
                            </Badge>
                            {criterion.metricIcon && (
                              <span className="text-lg">{criterion.metricIcon}</span>
                            )}
                            <div>
                              <div className="font-medium">{criterion.metricLabel}</div>
                              <div className="text-xs text-muted-foreground">
                                Key: <code className="bg-muted px-1 py-0.5 rounded">{criterion.metricKey}</code>
                              </div>
                            </div>
                            {criterion.metricColor && (
                              <div
                                className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                                style={{ backgroundColor: criterion.metricColor }}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCriterion(criterion)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCriterion(criterion)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {criteriaByCategory.size === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ListTree className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No criteria configured yet. Click "Add Criterion" to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}