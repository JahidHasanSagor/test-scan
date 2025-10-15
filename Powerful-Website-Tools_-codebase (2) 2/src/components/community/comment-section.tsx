"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Reply, Loader2 } from "lucide-react";
import { VoteButtons } from "./vote-buttons";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  author: {
    name: string;
    image: string | null;
    role: string;
  };
  userVote: "upvote" | "downvote" | null;
  replies?: Comment[];
};

type CommentSectionProps = {
  threadId: number;
  initialComments: Comment[];
};

export function CommentSection({ threadId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = React.useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<number | null>(null);
  const [replyContent, setReplyContent] = React.useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/community/threads/${threadId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data]);
        setNewComment("");
        toast.success("Comment posted!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/community/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: replyContent.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the comments tree with the new reply
        const updateCommentsWithReply = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replyCount: comment.replyCount + 1,
                replies: [...(comment.replies || []), data],
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentsWithReply(comment.replies),
              };
            }
            return comment;
          });
        };

        setComments(updateCommentsWithReply(comments));
        setReplyContent("");
        setReplyingTo(null);
        toast.success("Reply posted!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentVoteChange = (
    commentId: number,
    newVote: "upvote" | "downvote" | null,
    newUpvotes: number,
    newDownvotes: number
  ) => {
    const updateCommentVote = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            userVote: newVote,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentVote(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(updateCommentVote(comments));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-chart-3" />
        <h2 className="text-xl font-bold">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Textarea
          placeholder={
            session?.user
              ? "Share your thoughts..."
              : "Please log in to comment"
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          maxLength={2000}
          disabled={!session?.user || isSubmitting}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {newComment.length}/2,000 characters
          </p>
          <Button type="submit" disabled={!session?.user || isSubmitting || !newComment.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Comment"
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            index={index}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmitReply={handleSubmitReply}
            isSubmitting={isSubmitting}
            onVoteChange={handleCommentVoteChange}
          />
        ))}
      </div>
    </div>
  );
}

type CommentCardProps = {
  comment: Comment;
  index: number;
  depth?: number;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (commentId: number) => void;
  isSubmitting: boolean;
  onVoteChange: (commentId: number, newVote: "upvote" | "downvote" | null, newUpvotes: number, newDownvotes: number) => void;
};

function CommentCard({
  comment,
  index,
  depth = 0,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  isSubmitting,
  onVoteChange,
}: CommentCardProps) {
  const { data: session } = useSession();
  const maxDepth = 5;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        depth > 0 && "ml-8 border-l-2 border-border pl-4"
      )}
    >
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex gap-3">
          {/* Vote Section */}
          <VoteButtons
            itemId={comment.id}
            itemType="comment"
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userVote={comment.userVote}
            onVoteChange={(newVote, newUpvotes, newDownvotes) =>
              onVoteChange(comment.id, newVote, newUpvotes, newDownvotes)
            }
            size="sm"
          />

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.author.image || undefined} />
                <AvatarFallback className="text-xs">
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{comment.author.name}</span>
              {comment.author.role === "admin" && (
                <Badge variant="destructive" className="text-xs py-0">
                  Admin
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Content */}
            <p className="text-sm mb-3 whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="h-7 px-2 text-xs"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </Button>
              )}
              {comment.replyCount > 0 && !comment.replies && (
                <span className="text-xs text-muted-foreground">
                  {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
                </span>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  disabled={isSubmitting}
                  className="resize-none text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {replyContent.length}/2,000 characters
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onSubmitReply(comment.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post Reply"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply, replyIndex) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              index={replyIndex}
              depth={depth + 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={onSubmitReply}
              isSubmitting={isSubmitting}
              onVoteChange={onVoteChange}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}