"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { SocialShare } from "@/components/social-share";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: string;
  featured: boolean;
  viewCount: number;
  readTime: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

type RelatedPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  readTime: string;
  publishedAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author?: {
    name: string;
    email: string;
    image: string | null;
  };
  authorName?: string;
  authorEmail?: string;
};

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: RelatedPost[];
  initialComments: Comment[];
  slug: string;
}

function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function BlogPostClient({ post, relatedPosts, initialComments, slug }: BlogPostClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [comments, setComments] = React.useState<Comment[]>(initialComments);
  const [commentLoading, setCommentLoading] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  
  // Comment form state
  const [commentContent, setCommentContent] = React.useState("");
  const [guestName, setGuestName] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");

  const handleSearch = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!session && (!guestName.trim() || !guestEmail.trim())) {
      toast.error("Please provide your name and email");
      return;
    }

    setCommentLoading(true);
    try {
      const body = session
        ? { content: commentContent }
        : { content: commentContent, authorName: guestName, authorEmail: guestEmail };

      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Comment submitted! It will appear after approval.");
        setCommentContent("");
        setGuestName("");
        setGuestEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit comment");
      }
    } catch (error) {
      console.error("Comment submission error:", error);
      toast.error("Failed to submit comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post.title;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
        setShowShareMenu(false);
        return;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      setShowShareMenu(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader showSearch showAuth onSearchSubmit={handleSearch} />

      <main className="container mx-auto px-4 py-6">
        <article className="mx-auto max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/blog")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category.name}
              </Badge>
            )}
            
            <h1 className="mb-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <p className="mb-6 text-lg text-muted-foreground">{post.excerpt}</p>

            {/* Article Meta */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {post.author && (
                  <div className="flex items-center gap-2">
                    {post.author.image ? (
                      <img
                        src={post.author.image}
                        alt={post.author.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{post.author.name}</p>
                      <p className="text-xs">Author</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{post.viewCount} views</span>
                  </div>
                </div>
              </div>
              <SocialShare
                url={shareUrl}
                title={post.title}
                description={post.excerpt}
                variant="outline"
                size="sm"
              />
            </div>

            {/* Share Buttons */}
            <div className="relative mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Article
              </Button>

              {showShareMenu && (
                <div className="absolute left-0 top-full z-10 mt-2 flex gap-2 rounded-lg border border-border bg-card p-2 shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("facebook")}
                    className="gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("twitter")}
                    className="gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("linkedin")}
                    className="gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("copy")}
                    className="gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <a
                    key={tag.id}
                    href={`/blog?tag=${tag.id}`}
                    className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/80"
                  >
                    #{tag.name}
                  </a>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-10 overflow-hidden rounded-[var(--radius-lg)] border border-border">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="h-auto w-full"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: "1.125rem",
              lineHeight: "1.75",
              color: "var(--color-foreground)",
            }}
          />

          {/* Share Section */}
          <div className="my-10 rounded-[var(--radius-lg)] border border-border bg-card p-6 text-center">
            <h3 className="mb-2 font-display text-lg font-semibold">Enjoyed this article?</h3>
            <p className="mb-4 text-sm text-muted-foreground">Share it with your network!</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")}>
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Author Bio */}
          {post.author && (
            <div className="mb-12 rounded-[var(--radius-lg)] border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                {post.author.image ? (
                  <img
                    src={post.author.image}
                    alt={post.author.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <User className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <h3 className="mb-1 font-display text-lg font-semibold">
                    Written by {post.author.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Contributing author sharing insights on AI, productivity, and modern workflows.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div id="comments" className="mb-12">
            <h2 className="mb-6 font-display text-2xl font-bold">
              <MessageCircle className="mb-1 mr-2 inline-block h-6 w-6" />
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8 rounded-[var(--radius-lg)] border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Leave a Comment</h3>
              
              {!session && (
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                      Name *
                    </label>
                    <Input
                      id="name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="comment" className="mb-2 block text-sm font-medium">
                  Comment *
                </label>
                <Textarea
                  id="comment"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" disabled={commentLoading}>
                {commentLoading ? "Submitting..." : "Post Comment"}
              </Button>

              <p className="mt-3 text-xs text-muted-foreground">
                Your comment will be reviewed before being published.
              </p>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-[var(--radius)] border border-border bg-card p-5"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      {comment.author?.image ? (
                        <img
                          src={comment.author.image}
                          alt={comment.author.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {comment.author?.name || comment.authorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mx-auto max-w-6xl">
            <h2 className="mb-6 font-display text-2xl font-bold">Related Articles</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <Card
                  key={related.id}
                  className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <a href={`/blog/${related.slug}`} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-secondary">
                      {related.featuredImage ? (
                        <img
                          src={related.featuredImage}
                          alt={related.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold">
                        {related.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {related.excerpt}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <time dateTime={related.publishedAt}>
                          {formatDate(related.publishedAt)}
                        </time>
                        <span>•</span>
                        <span>{related.readTime}</span>
                      </div>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}