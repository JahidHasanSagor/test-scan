"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import Link from "next/link";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  User,
  Clock,
  Pin,
  Reply,
  Loader2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Author = {
  id?: string;
  name: string;
  image: string | null;
  role: string;
};

type Comment = {
  id: number;
  threadId: number;
  parentCommentId: number | null;
  userId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  userVote: 'upvote' | 'downvote' | null;
  replies: Comment[];
};

type Thread = {
  id: number;
  userId: string;
  title: string;
  content: string;
  category: string | null;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  userVote: 'upvote' | 'downvote' | null;
  comments: Comment[];
};

export default function ThreadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = params.id as string;
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [thread, setThread] = React.useState<Thread | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<number | null>(null);
  const [replyContent, setReplyContent] = React.useState("");

  const fetchThread = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/community/threads/${threadId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setThread(data);
      } else {
        toast.error("Failed to load thread");
        router.push("/community");
      }
    } catch (error) {
      console.error("Error fetching thread:", error);
      toast.error("Failed to load thread");
      router.push("/community");
    } finally {
      setIsLoading(false);
    }
  }, [threadId, router]);

  React.useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handleThreadVote = async (voteType: 'upvote' | 'downvote') => {
    if (!session?.user) {
      toast.error("Please log in to vote");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!thread) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/community/threads/${thread.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setThread((prev) =>
          prev
            ? {
                ...prev,
                upvotes: data.thread.upvotes,
                downvotes: data.thread.downvotes,
                userVote: data.userVote,
              }
            : null
        );
      } else {
        toast.error("Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const handleCommentVote = async (commentId: number, voteType: 'upvote' | 'downvote') => {
    if (!session?.user) {
      toast.error("Please log in to vote");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/community/comments/${commentId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update comment in nested structure
        const updateCommentVote = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                upvotes: data.comment.upvotes,
                downvotes: data.comment.downvotes,
                userVote: data.userVote,
              };
            }
            if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentVote(comment.replies),
              };
            }
            return comment;
          });
        };

        setThread((prev) =>
          prev
            ? {
                ...prev,
                comments: updateCommentVote(prev.comments),
              }
            : null
        );
      } else {
        toast.error("Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const handleSubmitComment = async () => {
    if (!session?.user) {
      toast.error("Please log in to comment");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!newComment.trim() || !thread) return;

    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/community/threads/${thread.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        toast.success("Comment posted!");
        setNewComment("");
        fetchThread(); // Refresh to get updated comments
      } else {
        toast.error("Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!session?.user) {
      toast.error("Please log in to reply");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/community/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent.trim() }),
      });

      if (response.ok) {
        toast.success("Reply posted!");
        setReplyContent("");
        setReplyingTo(null);
        fetchThread(); // Refresh to get updated comments
      } else {
        toast.error("Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const score = comment.upvotes - comment.downvotes;

    return (
      <div key={comment.id} className={cn("space-y-3", depth > 0 && "ml-8 pl-4 border-l-2 border-border")}>
        <Card className="p-4">
          <div className="flex gap-3">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => handleCommentVote(comment.id, "upvote")}
                className={cn(
                  "p-1 rounded hover:bg-secondary transition-colors",
                  comment.userVote === "upvote" && "text-chart-2"
                )}
                aria-label="Upvote"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold">{score}</span>
              <button
                onClick={() => handleCommentVote(comment.id, "downvote")}
                className={cn(
                  "p-1 rounded hover:bg-secondary transition-colors",
                  comment.userVote === "downvote" && "text-destructive"
                )}
                aria-label="Downvote"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="font-medium">{comment.author.name}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(comment.createdAt)}</span>
              </div>

              <p className="text-sm mb-3 whitespace-pre-wrap break-words">{comment.content}</p>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!session?.user) {
                    toast.error("Please log in to reply");
                    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                    return;
                  }
                  setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  setReplyContent("");
                }}
                className="h-7 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim()}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Post Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Nested Replies */}
        {comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <SiteHeader
          showAuth={false}
          customAuthSlot={
            session?.user ? (
              <ProfileTrigger onClick={() => setSidebarOpen(true)} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth">
                  <Button variant="ghost" className="hover:bg-secondary">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="shadow-sm">Sign up</Button>
                </Link>
              </div>
            )
          }
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader
        showAuth={false}
        customAuthSlot={
          session?.user ? (
            <ProfileTrigger onClick={() => setSidebarOpen(true)} />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" className="hover:bg-secondary">
                  Log in
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="shadow-sm">Sign up</Button>
              </Link>
            </div>
          )
        }
      />

      <ProfileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/community")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Button>

        {/* Thread */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-8">
            <div className="flex gap-4">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleThreadVote("upvote")}
                  className={cn(
                    "p-2 rounded hover:bg-secondary transition-colors",
                    thread.userVote === "upvote" && "text-chart-2"
                  )}
                  aria-label="Upvote"
                >
                  <ThumbsUp className="h-6 w-6" />
                </button>
                <span className="text-lg font-bold">
                  {thread.upvotes - thread.downvotes}
                </span>
                <button
                  onClick={() => handleThreadVote("downvote")}
                  className={cn(
                    "p-2 rounded hover:bg-secondary transition-colors",
                    thread.userVote === "downvote" && "text-destructive"
                  )}
                  aria-label="Downvote"
                >
                  <ThumbsDown className="h-6 w-6" />
                </button>
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-3">
                  {thread.isPinned && (
                    <Pin className="h-5 w-5 text-chart-4 flex-shrink-0 mt-1" />
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold">{thread.title}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  {thread.category && (
                    <Badge variant="secondary">{thread.category}</Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{thread.author.name}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeAgo(thread.createdAt)}</span>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap break-words">{thread.content}</p>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{thread.commentCount} comments</span>
                </div>
              </div>
            </div>
          </Card>

          {/* New Comment Form */}
          <Card className="p-4 mb-6">
            <h3 className="font-semibold mb-3">Add a comment</h3>
            <Textarea
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] mb-3"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </Card>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Comments ({thread.commentCount})
            </h3>
            {thread.comments.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {thread.comments.map((comment) => renderComment(comment))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}