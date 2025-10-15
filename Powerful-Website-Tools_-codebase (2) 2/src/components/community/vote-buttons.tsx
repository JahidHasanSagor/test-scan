"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type VoteButtonsProps = {
  itemId: number;
  itemType: "thread" | "comment";
  upvotes: number;
  downvotes: number;
  userVote: "upvote" | "downvote" | null;
  onVoteChange?: (newVote: "upvote" | "downvote" | null, newUpvotes: number, newDownvotes: number) => void;
  size?: "sm" | "default";
};

export function VoteButtons({
  itemId,
  itemType,
  upvotes,
  downvotes,
  userVote,
  onVoteChange,
  size = "default",
}: VoteButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isVoting, setIsVoting] = React.useState(false);
  const [localVote, setLocalVote] = React.useState(userVote);
  const [localUpvotes, setLocalUpvotes] = React.useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = React.useState(downvotes);

  React.useEffect(() => {
    setLocalVote(userVote);
    setLocalUpvotes(upvotes);
    setLocalDownvotes(downvotes);
  }, [userVote, upvotes, downvotes]);

  const score = localUpvotes - localDownvotes;

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const endpoint = itemType === "thread"
        ? `/api/community/threads/${itemId}/vote`
        : `/api/community/comments/${itemId}/vote`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        const item = itemType === "thread" ? data.thread : data.comment;
        
        setLocalVote(data.userVote);
        setLocalUpvotes(item.upvotes);
        setLocalDownvotes(item.downvotes);
        
        onVoteChange?.(data.userVote, item.upvotes, item.downvotes);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const buttonSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const scoreSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          "hover:bg-chart-2/10",
          localVote === "upvote" && "bg-chart-2/20 text-chart-2 hover:bg-chart-2/30"
        )}
        onClick={() => handleVote("upvote")}
        disabled={isVoting}
      >
        <ArrowUp className={iconSize} />
      </Button>
      
      <span
        className={cn(
          "font-semibold",
          scoreSize,
          score > 0 && "text-chart-2",
          score < 0 && "text-destructive"
        )}
      >
        {score}
      </span>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          "hover:bg-destructive/10",
          localVote === "downvote" && "bg-destructive/20 text-destructive hover:bg-destructive/30"
        )}
        onClick={() => handleVote("downvote")}
        disabled={isVoting}
      >
        <ArrowDown className={iconSize} />
      </Button>
    </div>
  );
}