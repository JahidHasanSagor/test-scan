"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import { ThreadList } from "@/components/community/thread-list";
import { CreateThreadDialog } from "@/components/community/create-thread-dialog";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SortOption = "hot" | "new" | "top";

const CATEGORIES = [
  "All",
  "Tool Recommendations",
  "Show & Tell",
  "Help & Support",
  "General Discussion",
  "Feature Requests",
];

export default function CommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sort, setSort] = React.useState<SortOption>("hot");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const handleCreatePost = () => {
    if (!session?.user) {
      toast.error("Please log in to create a post");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setCreateDialogOpen(true);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader
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
                <Button className="shadow-sm">Sign up</Button>
              </Link>
            </div>
          )
        }
      />

      <ProfileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <CreateThreadDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Community</h1>
              <p className="text-muted-foreground">
                Discuss tools, share experiences, and connect with the community
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleCreatePost}
              className="shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Post
            </Button>
          </div>

          {/* Sort & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Button
                variant={sort === "hot" ? "default" : "outline"}
                size="sm"
                onClick={() => setSort("hot")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Hot
              </Button>
              <Button
                variant={sort === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setSort("new")}
              >
                <Clock className="h-4 w-4 mr-2" />
                New
              </Button>
              <Button
                variant={sort === "top" ? "default" : "outline"}
                size="sm"
                onClick={() => setSort("top")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Top
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Thread List */}
        <ThreadList sortMode={sort} />
      </main>

      <SiteFooter />
    </div>
  );
}