"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Pin } from "lucide-react";
import { VoteButtons } from "./vote-buttons";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  author: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
  score: number;
  userVote: "upvote" | "downvote" | null;
};

type ThreadCardProps = {
  thread: Thread;
  index: number;
  onUpdate: (threadId: number, updates: Partial<Thread>) => void;
};

export function ThreadCard({ thread, index, onUpdate }: ThreadCardProps) {
  const router = useRouter();

  const handleVoteChange = (newVote: "upvote" | "downvote" | null, newUpvotes: number, newDownvotes: number) => {
    onUpdate(thread.id, {
      userVote: newVote,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newUpvotes - newDownvotes,
    });
  };

  const handleClick = () => {
    router.push(`/community/thread/${thread.id}`);
  };

  const contentPreview = thread.content.length > 200
    ? thread.content.substring(0, 200) + "..."
    : thread.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200",
        thread.isPinned && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="p-4 sm:p-6">
        <div className="flex gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <VoteButtons
              itemId={thread.id}
              itemType="thread"
              upvotes={thread.upvotes}
              downvotes={thread.downvotes}
              userVote={thread.userVote}
              onVoteChange={handleVoteChange}
            />
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start gap-2 flex-wrap mb-2">
              {thread.isPinned && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
              {thread.category && (
                <Badge variant="outline">{thread.category}</Badge>
              )}
            </div>

            {/* Title */}
            <h3
              className="text-lg sm:text-xl font-semibold mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2"
              onClick={handleClick}
            >
              {thread.title}
            </h3>

            {/* Content Preview */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {contentPreview}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={thread.author.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {thread.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{thread.author.name}</span>
                {thread.author.role === "admin" && (
                  <Badge variant="destructive" className="text-xs py-0">
                    Admin
                  </Badge>
                )}
              </div>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto flex items-center gap-2"
                onClick={handleClick}
              >
                <MessageSquare className="h-4 w-4" />
                {thread.commentCount} {thread.commentCount === 1 ? "comment" : "comments"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}