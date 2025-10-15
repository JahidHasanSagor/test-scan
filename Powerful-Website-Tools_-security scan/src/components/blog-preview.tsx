"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  image: string;
  tag: string;
  author: string;
  date: string; // ISO
  readTime: string; // e.g. "6 min read"
};

export type BlogPreviewProps = {
  className?: string;
  style?: React.CSSProperties;
  posts?: BlogPost[];
};

const defaultPosts: BlogPost[] = [
  {
    id: "b1",
    title: "The 2025 Stack for Building with AI Tools",
    excerpt:
      "From prompt workflows to evaluation loops — a practical stack to build reliably with modern AI tooling.",
    url: "/blog/2025-ai-stack",
    image: "",
    tag: "AI",
    author: "Alex Chen",
    date: "2025-06-12",
    readTime: "7 min read",
  },
  {
    id: "b2",
    title: "Design Patterns from Apple You Can Borrow",
    excerpt:
      "Learn subtle motion, spacing, and typographic moves inspired by Apple to elevate any product UI.",
    url: "/blog/apple-design-patterns",
    image: "",
    tag: "Design",
    author: "Priya Nair",
    date: "2025-07-02",
    readTime: "6 min read",
  },
  {
    id: "b3",
    title: "Zapier-style Directories: What Really Works",
    excerpt:
      "A breakdown of information density, sorting heuristics, and card anatomy that convert browsers into users.",
    url: "/blog/zapier-directory-lessons",
    image: "",
    tag: "Playbook",
    author: "Diego Ramos",
    date: "2025-08-18",
    readTime: "8 min read",
  },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export const BlogPreview = ({ className, style, posts }: BlogPreviewProps) => {
  const [apiFetchedPosts, setApiFetchedPosts] = React.useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/blog/featured", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          
          const transformedPosts = (data.posts || []).map((post: any) => ({
            id: post.id.toString(),
            title: post.title,
            excerpt: post.excerpt || post.content?.substring(0, 150) + "...",
            url: `/blog/${post.slug}`,
            image: post.featuredImage || "",
            tag: post.category?.name || "Blog",
            author: post.author?.name || "Anonymous",
            date: post.publishedAt || post.createdAt,
            readTime: `${Math.ceil((post.content?.length || 0) / 200)} min read`,
          })).slice(0, 3);
          
          setApiFetchedPosts(transformedPosts);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const data = posts && posts.length > 0 
    ? posts 
    : apiFetchedPosts.length > 0 
      ? apiFetchedPosts 
      : defaultPosts;

  return (
    <section
      className={cn("w-full", className)}
      style={style}
      aria-label="Latest blog posts"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-chart-5/15">
          <svg width="20" height="20" viewBox="0 0 24 24" className="text-chart-5" fill="currentColor" aria-hidden>
            <path d="M4 5h16v2H4zM4 11h10v2H4zM4 17h16v2H4z" />
          </svg>
        </span>
        <div>
          <h3 className="font-display text-lg font-bold sm:text-xl">From the blog</h3>
          <p className="text-sm text-muted-foreground">Insights, patterns, and playbooks to build better.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse overflow-hidden rounded-[var(--radius)] border-border bg-card">
              <div className="aspect-[16/9] w-full bg-muted/50" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-muted/50 rounded" />
                <div className="h-4 w-full bg-muted/50 rounded" />
                <div className="h-4 w-5/6 bg-muted/50 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className="group relative overflow-hidden rounded-[var(--radius)] border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                role="article"
                aria-labelledby={`post-${p.id}-title`}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-secondary">
                  <img
                    src={p.image}
                    alt="Post cover"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <Badge className="bg-accent text-foreground hover:bg-accent/80">{p.tag}</Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h4 id={`post-${p.id}-title`} className="mb-2 line-clamp-2 font-display text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                    {p.title}
                  </h4>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-2 p-5 pt-0 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground/80">{p.author}</span>
                    <span>•</span>
                    <time dateTime={p.date}>{formatDate(p.date)}</time>
                    <span>•</span>
                    <span>{p.readTime}</span>
                  </div>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="h-8 px-3 text-xs font-semibold hover:shadow-sm transition-shadow"
                  >
                    <a href={p.url} className="inline-flex items-center">
                      Read article
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};