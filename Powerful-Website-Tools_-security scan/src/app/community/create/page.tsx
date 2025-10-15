"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Tool Recommendations",
  "Show & Tell",
  "Help & Support",
  "General Discussion",
  "Feature Requests",
];

export default function CreateThreadPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isPending && !session?.user) {
      toast.error("Please log in to create a post");
      router.push("/login?redirect=/community/create");
    }
  }, [session, isPending, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (title.length > 300) {
      toast.error("Title must be 300 characters or less");
      return;
    }

    if (content.length > 10000) {
      toast.error("Content must be 10,000 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/community/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: category || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Post created successfully!");
        router.push(`/community/${data.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <SiteHeader showAuth={false} customAuthSlot={<div />} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader
        showAuth={false}
        customAuthSlot={
          <ProfileTrigger onClick={() => setSidebarOpen(true)} />
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

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              Create a New Post
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="What's your post about?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={300}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/300 characters
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, questions, or experiences..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px]"
                  maxLength={10000}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {content.length}/10,000 characters
                </p>
              </div>

              {/* Guidelines */}
              <Card className="p-4 bg-muted/50">
                <h3 className="font-semibold mb-2 text-sm">Posting Guidelines</h3>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Be respectful and constructive</li>
                  <li>Stay on topic and relevant to the community</li>
                  <li>Use clear and descriptive titles</li>
                  <li>Format your content for readability</li>
                  <li>Search before posting to avoid duplicates</li>
                </ul>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Create Post
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/community")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}