"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type CreateThreadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateThreadDialog({ open, onOpenChange }: CreateThreadDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    content: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/community/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Thread created successfully!");
        onOpenChange(false);
        setFormData({ title: "", content: "", category: "" });
        router.push(`/community/thread/${data.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create thread");
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error("Failed to create thread");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Thread</DialogTitle>
            <DialogDescription>
              Start a new conversation in the community
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="What's on your mind?"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={300}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/300 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Tool Recommendations, Discussion"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts in detail..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={8}
                maxLength={10000}
                required
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.content.length}/10,000 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Thread"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}