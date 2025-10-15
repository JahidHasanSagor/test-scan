"use client";

import * as React from "react";
import { ThreadCard } from "./thread-card";
import { Loader2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

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

type ThreadListProps = {
  sortMode: "hot" | "new" | "top";
};

export function ThreadList({ sortMode }: ThreadListProps) {
  const { data: session } = useSession();
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [total, setTotal] = React.useState(0);

  const fetchThreads = React.useCallback(async (offset = 0, append = false) => {
    const loadingSetter = offset === 0 ? setIsLoading : setIsLoadingMore;
    loadingSetter(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const params = new URLSearchParams({
        sort: sortMode,
        limit: "20",
        offset: offset.toString(),
      });

      const response = await fetch(`/api/community/threads?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        if (append) {
          setThreads(prev => [...prev, ...data.threads]);
        } else {
          setThreads(data.threads);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      loadingSetter(false);
    }
  }, [sortMode]);

  React.useEffect(() => {
    fetchThreads(0, false);
  }, [fetchThreads]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchThreads(threads.length, true);
    }
  };

  const handleThreadUpdate = (threadId: number, updates: Partial<Thread>) => {
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, ...updates } : t))
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border bg-card p-6"
          >
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 bg-secondary rounded" />
                <div className="h-6 w-8 bg-secondary rounded" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-secondary rounded" />
                <div className="h-4 w-full bg-secondary rounded" />
                <div className="h-4 w-5/6 bg-secondary rounded" />
                <div className="flex gap-2 mt-4">
                  <div className="h-4 w-20 bg-secondary rounded" />
                  <div className="h-4 w-24 bg-secondary rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
          <Flame className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No threads yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Be the first to start a conversation in the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread, index) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          index={index}
          onUpdate={handleThreadUpdate}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${total - threads.length} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}