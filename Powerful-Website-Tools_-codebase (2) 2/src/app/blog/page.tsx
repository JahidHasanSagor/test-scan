"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BlogCardGridSkeleton } from "@/components/skeletons/blog-card-skeleton";
import { Search, ChevronLeft, ChevronRight, Calendar, Clock, User, Loader2 } from "lucide-react";
import { sanitizeImageSrc } from "@/lib/security/url-sanitizer";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  readTime: string;
  viewCount: number;
  publishedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string;
    email: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  postCount: number;
};

type Tag = {
  id: number;
  name: string;
  slug: string;
  usageCount: number;
};

type FeaturedPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  readTime: string;
  viewCount: number;
  publishedAt: string;
  author: {
    name: string;
    image: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
};

function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("search") || "");
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = React.useState<FeaturedPost[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [featuredIndex, setFeaturedIndex] = React.useState(0);

  const selectedCategory = searchParams.get("category");
  const selectedTag = searchParams.get("tag");
  const currentPage = parseInt(searchParams.get("page") || "1");
  const postsPerPage = 9;

  // Fetch featured posts
  React.useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/blog/featured?limit=3");
        if (res.ok) {
          const data = await res.json();
          setFeaturedPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch featured posts:", error);
      }
    }
    fetchFeatured();
  }, []);

  // Fetch categories
  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/blog/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch tags
  React.useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/blog/tags");
        if (res.ok) {
          const data = await res.json();
          setTags(data.slice(0, 20)); // Limit to top 20 tags
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    }
    fetchTags();
  }, []);

  // Fetch posts
  React.useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          status: "published",
          limit: postsPerPage.toString(),
          offset: ((currentPage - 1) * postsPerPage).toString(),
          sort: "newest",
        });

        if (searchQuery) params.set("search", searchQuery);
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedTag) params.set("tag", selectedTag);

        const res = await fetch(`/api/blog?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
          setTotal(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [searchQuery, selectedCategory, selectedTag, currentPage]);

  // Auto-rotate featured posts
  React.useEffect(() => {
    if (featuredPosts.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredPosts.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery, page: "1" });
  };

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/blog?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    router.push("/blog");
  };

  const totalPages = Math.ceil(total / postsPerPage);
  const hasFilters = searchQuery || selectedCategory || selectedTag;
  const currentFeatured = featuredPosts[featuredIndex];

  return (
    <>
      <SiteHeader showAuth />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Hero Section with Featured Post Carousel */}
        {currentFeatured && (
          <section className="mx-auto max-w-6xl mb-10 sm:mb-12">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
              <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
                {/* Featured Image */}
                <div className="relative aspect-[16/9] md:aspect-square overflow-hidden rounded-[var(--radius)] bg-secondary">
                  {currentFeatured.featuredImage ? (
                    <img
                      src={sanitizeImageSrc(currentFeatured.featuredImage)}
                      alt={currentFeatured.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-chart-2 text-white hover:bg-chart-2/90">Featured</Badge>
                  </div>
                </div>

                {/* Featured Content */}
                <div className="flex flex-col justify-center">
                  <div className="mb-3">
                    <Badge variant="secondary">{currentFeatured.category.name}</Badge>
                  </div>
                  <h1 className="mb-3 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                    {currentFeatured.title}
                  </h1>
                  <p className="mb-4 line-clamp-3 text-muted-foreground">
                    {currentFeatured.excerpt}
                  </p>
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>{currentFeatured.author.name}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={currentFeatured.publishedAt}>
                        {formatDate(currentFeatured.publishedAt)}
                      </time>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{currentFeatured.readTime}</span>
                    </div>
                  </div>
                  <Button asChild size="lg">
                    <a href={`/blog/${currentFeatured.slug}`}>Read Article</a>
                  </Button>
                </div>
              </div>

              {/* Carousel Indicators */}
              {featuredPosts.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {featuredPosts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === featuredIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                      }`}
                      aria-label={`Go to featured post ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <section className="mx-auto max-w-6xl mb-8">
          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Categories */}
            <div className="mb-4">
              <h3 className="mb-3 text-sm font-semibold">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters({ category: cat.id.toString(), page: "1" })}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === cat.id.toString()
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {cat.name} <span className="text-xs opacity-70">({cat.postCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 15).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => updateFilters({ tag: tag.id.toString(), page: "1" })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedTag === tag.id.toString()
                        ? "bg-chart-3 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Posts Grid */}
        <section className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {hasFilters ? "Search Results" : "Latest Articles"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? "article" : "articles"} found
              </p>
            </div>
          </div>

          {loading ? (
            <BlogCardGridSkeleton count={6} />
          ) : posts.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-border bg-card p-12 text-center">
              <p className="text-lg text-muted-foreground">
                No articles found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="group overflow-hidden rounded-[var(--radius)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <a href={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-secondary">
                      {post.featuredImage ? (
                        <img
                          src={sanitizeImageSrc(post.featuredImage)}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute left-3 top-3">
                          <Badge variant="secondary">{post.category.name}</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold leading-tight">
                        {post.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-3 p-5 pt-0">
                      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {post.author && (
                            <>
                              <span className="font-medium">{post.author.name}</span>
                              <span>•</span>
                            </>
                          )}
                          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardFooter>
                  </a>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilters({ page: page.toString() })}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <BlogContent />
      </Suspense>
    </div>
  );
}