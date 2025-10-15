"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Home, ArrowLeft, Compass, TrendingUp, Sparkles } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

type Tool = {
  id: number;
  title: string;
  description: string;
  category: string;
  url: string;
};

const POPULAR_CATEGORIES = [
  { name: "AI & Machine Learning", icon: "🤖", href: "/categories?cat=AI" },
  { name: "Design & Creative", icon: "🎨", href: "/categories?cat=Design" },
  { name: "Productivity", icon: "⚡", href: "/categories?cat=Productivity" },
  { name: "Developer Tools", icon: "💻", href: "/categories?cat=Development" },
  { name: "Marketing", icon: "📈", href: "/categories?cat=Marketing" },
  { name: "Analytics", icon: "📊", href: "/categories?cat=Analytics" },
];

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestedTools, setSuggestedTools] = React.useState<Tool[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch suggested tools (featured or popular)
  React.useEffect(() => {
    async function fetchSuggested() {
      try {
        const res = await fetch("/api/tools/featured?limit=3");
        if (res.ok) {
          const data = await res.json();
          setSuggestedTools(data);
        }
      } catch (error) {
        console.error("Failed to fetch suggested tools:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSuggested();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader showSearch showAuth onSearchSubmit={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)} />

      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          {/* 404 Message */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-chart-3 via-chart-5 to-chart-2 text-5xl font-bold text-white shadow-lg">
              404
            </div>
            <h1 className="mb-3 font-display text-4xl font-bold sm:text-5xl">Page Not Found</h1>
            <p className="text-lg text-muted-foreground">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search for what you need
              </CardTitle>
              <CardDescription>
                Try searching for tools, websites, or resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search tools, websites, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mb-10">
            <h2 className="mb-4 font-display text-xl font-semibold">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
                  <Home className="h-6 w-6" />
                  <span className="font-semibold">Go Home</span>
                  <span className="text-xs text-muted-foreground">Return to homepage</span>
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
                  <Compass className="h-6 w-6" />
                  <span className="font-semibold">Browse Tools</span>
                  <span className="text-xs text-muted-foreground">Explore all tools</span>
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
                  <TrendingUp className="h-6 w-6" />
                  <span className="font-semibold">Categories</span>
                  <span className="text-xs text-muted-foreground">Browse by category</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-10">
            <h2 className="mb-4 font-display text-xl font-semibold">Popular Categories</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {POPULAR_CATEGORIES.map((category) => (
                <Link key={category.name} href={category.href}>
                  <Card className="transition-all hover:-translate-y-1 hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="text-3xl">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Suggested Tools */}
          {!isLoading && suggestedTools.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                <Sparkles className="h-5 w-5 text-chart-2" />
                Featured Tools You Might Like
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {suggestedTools.map((tool) => (
                  <Link key={tool.id} href={`/tool/${tool.id}`}>
                    <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-base line-clamp-1">{tool.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{tool.category}</span>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-10 text-center">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}