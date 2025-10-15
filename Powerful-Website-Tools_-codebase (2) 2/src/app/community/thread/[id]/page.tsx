"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import { VoteButtons } from "@/components/community/vote-buttons";
import { CommentSection } from "@/components/community/comment-section";
import Link from "next/link";
import { ArrowLeft, Pin, Loader2, Edit, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

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
    name: string;
    image: string | null;
    role: string;
  };
  userVote: "upvote" | "downvote" | null;
  comments: any[];
};

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [thread, setThread] = React.useState<Thread | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const threadId = params.id as string;

  React.useEffect(() => {
    const fetchThread = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch(`/api/community/threads/${threadId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          setThread(data);
        } else if (response.status === 404) {
          toast.error("Thread not found");
          router.push("/community");
        } else {
          toast.error("Failed to load thread");
        }
      } catch (error) {
        console.error("Error fetching thread:", error);
        toast.error("Failed to load thread");
      } finally {
        setIsLoading(false);
      }
    };

    if (threadId) {
      fetchThread();
    }
  }, [threadId, router]);

  const handleVoteChange = (
    newVote: "upvote" | "downvote" | null,
    newUpvotes: number,
    newDownvotes: number
  ) => {
    if (thread) {
      setThread({
        ...thread,
        userVote: newVote,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      });
    }
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
        <ProfileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!thread) {
    return null;
  }

  const score = thread.upvotes - thread.downvotes;

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
        <Link href="/community">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Thread Card */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-6 sm:p-8">
              <div className="flex gap-6">
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
                  <div className="flex items-start gap-2 flex-wrap mb-4">
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
                  <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                    {thread.title}
                  </h1>

                  {/* Content */}
                  <div className="prose prose-sm max-w-none mb-6 text-foreground whitespace-pre-wrap break-words">
                    {thread.content}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 flex-wrap text-sm border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={thread.author.image || undefined} />
                        <AvatarFallback>
                          {thread.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{thread.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(thread.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {thread.author.role === "admin" && (
                        <Badge variant="destructive" className="ml-2">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <CommentSection
              threadId={thread.id}
              initialComments={thread.comments || []}
            />
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}