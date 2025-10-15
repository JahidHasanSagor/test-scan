"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  Shield,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  UserCog,
  Star,
  Calendar,
  Mail,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  tool: {
    id: number;
    title: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type Stats = {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [stats, setStats] = React.useState<Stats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | number | null>(null);
  
  // Filters
  const [userSearchQuery, setUserSearchQuery] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState("all");
  const [reviewStatusFilter, setReviewStatusFilter] = React.useState("all");
  const [reviewSearchQuery, setReviewSearchQuery] = React.useState("");

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users - you'll need to create this API endpoint
      const usersRes = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      // Fetch reviews
      const reviewsRes = await fetch("/api/reviews", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData.users || []);
        
        // Calculate stats
        const total = userData.users?.length || 0;
        const admins = userData.users?.filter((u: User) => u.role === "admin").length || 0;
        const regular = total - admins;
        
        setStats(prev => ({
          ...prev,
          totalUsers: total,
          adminUsers: admins,
          regularUsers: regular,
        }));
      }

      if (reviewsRes.ok) {
        const reviewData = await reviewsRes.json();
        setReviews(reviewData.reviews || []);
        
        const total = reviewData.reviews?.length || 0;
        const pending = reviewData.reviews?.filter((r: Review) => r.status === "pending").length || 0;
        const approved = reviewData.reviews?.filter((r: Review) => r.status === "approved").length || 0;
        
        setStats(prev => ({
          ...prev,
          totalReviews: total,
          pendingReviews: pending,
          approvedReviews: approved,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        toast.success("User role updated successfully");
        fetchData();
      } else {
        toast.error("Failed to update user role");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveReview = async (reviewId: number) => {
    setActionLoading(reviewId);
    try {
      const res = await fetch(`/api/blog/comments/${reviewId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        toast.success("Review approved");
        fetchData();
      } else {
        toast.error("Failed to approve review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReview = async (reviewId: number) => {
    setActionLoading(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (res.ok) {
        toast.success("Review rejected");
        fetchData();
      } else {
        toast.error("Failed to reject review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users
  const filteredUsers = React.useMemo(() => {
    let filtered = [...users];

    if (userSearchQuery.trim()) {
      const query = userSearchQuery.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    if (userRoleFilter !== "all") {
      filtered = filtered.filter(u => u.role === userRoleFilter);
    }

    return filtered;
  }, [users, userSearchQuery, userRoleFilter]);

  // Filter reviews
  const filteredReviews = React.useMemo(() => {
    let filtered = [...reviews];

    if (reviewSearchQuery.trim()) {
      const query = reviewSearchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.comment.toLowerCase().includes(query) ||
          r.tool.title.toLowerCase().includes(query) ||
          r.user.name.toLowerCase().includes(query)
      );
    }

    if (reviewStatusFilter !== "all") {
      filtered = filtered.filter(r => r.status === reviewStatusFilter);
    }

    return filtered;
  }, [reviews, reviewSearchQuery, reviewStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Users & Reviews</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, roles, and moderate reviews
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.adminUsers} admins, {stats.regularUsers} regular
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admin Users
              </CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Platform administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.approvedReviews} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reviews
              </CardTitle>
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.pendingReviews}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting moderation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Users and Reviews */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Reviews ({filteredReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* User Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filteredUsers.length} User{filteredUsers.length !== 1 ? "s" : ""}
              </CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-chart-5 to-chart-3 text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role === "admin" ? (
                                <Shield className="h-3 w-3 mr-1" />
                              ) : null}
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.emailVerified ? "default" : "outline"}>
                              {user.emailVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => handleUpdateUserRole(user.id, newRole)}
                                disabled={actionLoading === user.id}
                              >
                                <SelectTrigger className="w-[120px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {/* Review Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews by comment, tool, or user..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filteredReviews.length} Review{filteredReviews.length !== 1 ? "s" : ""}
              </CardTitle>
              <CardDescription>Moderate user reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tool</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium max-w-[200px]">
                            <p className="truncate">{review.tool.title}</p>
                            <p className="text-xs text-muted-foreground">ID: {review.tool.id}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{review.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {review.user.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[300px] line-clamp-2 text-sm">
                              {review.comment}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                review.status === "approved" ? "default" : "secondary"
                              }
                            >
                              {review.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {review.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleApproveReview(review.id)}
                                    disabled={actionLoading === review.id}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRejectReview(review.id)}
                                    disabled={actionLoading === review.id}
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              {review.status === "approved" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRejectReview(review.id)}
                                  disabled={actionLoading === review.id}
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}