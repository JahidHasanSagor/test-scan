"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Star, Send } from "lucide-react";

interface GenreCriterion {
  id: number;
  category: string;
  metricKey: string;
  metricLabel: string;
  metricIcon: string | null;
  metricColor: string | null;
  displayOrder: number;
}

interface ReviewSubmissionFormProps {
  toolId: number;
  toolCategory: string;
  onSubmitSuccess?: () => void;
}

export function ReviewSubmissionForm({ 
  toolId, 
  toolCategory, 
  onSubmitSuccess 
}: ReviewSubmissionFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [genreCriteria, setGenreCriteria] = useState<GenreCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [metricScores, setMetricScores] = useState<Record<string, number>>({});
  const [metricComments, setMetricComments] = useState<Record<string, string>>({});
  const [overallRating, setOverallRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");

  React.useEffect(() => {
    async function loadCriteria() {
      if (!toolCategory) {
        setGenreCriteria([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/genre-criteria?category=${encodeURIComponent(toolCategory)}`);
        if (!res.ok) {
          throw new Error(`API responded with ${res.status}`);
        }
        const data = await res.json();
        setGenreCriteria(data);
      } catch (err) {
        console.error("Failed to load genre criteria:", err);
        setError("Failed to load review form. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCriteria();
  }, [toolCategory]);

  const handleScoreChange = (metricKey: string, value: number) => {
    setMetricScores(prev => ({
      ...prev,
      [metricKey]: value
    }));
  };

  const handleCommentChange = (metricKey: string, value: string) => {
    setMetricComments(prev => ({
      ...prev,
      [metricKey]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication
    if (!session?.user) {
      toast.error("Please sign in to submit a review");
      router.push(`/auth?redirect=/tool/${toolId}`);
      return;
    }

    // Validate form
    if (Object.keys(metricScores).length === 0) {
      toast.error("Please rate at least one metric");
      return;
    }

    if (!overallRating || overallRating < 1 || overallRating > 10) {
      toast.error("Please provide an overall rating between 1 and 10");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        router.push(`/auth?redirect=/tool/${toolId}`);
        return;
      }

      // Filter out empty comments
      const filteredComments: Record<string, string> = {};
      Object.entries(metricComments).forEach(([key, value]) => {
        if (value && value.trim()) {
          filteredComments[key] = value.trim();
        }
      });

      const payload = {
        toolId,
        metricScores,
        metricComments: Object.keys(filteredComments).length > 0 ? filteredComments : undefined,
        overallRating,
        reviewText: reviewText.trim() || undefined,
      };

      const response = await fetch("/api/structured-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "DUPLICATE_REVIEW") {
          toast.error("You have already reviewed this tool");
        } else {
          throw new Error(data.error || "Failed to submit review");
        }
        return;
      }

      toast.success("Review submitted successfully! It will be published after approval.");
      
      // Reset form
      const resetScores: Record<string, number> = {};
      genreCriteria.forEach((criterion) => {
        resetScores[criterion.metricKey] = 5;
      });
      setMetricScores(resetScores);
      setMetricComments({});
      setOverallRating(5);
      setReviewText("");

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Review</CardTitle>
          <CardDescription>Loading review form...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (genreCriteria.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Review</CardTitle>
          <CardDescription>Review form not available for this category</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're still setting up reviews for this category. Please check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Submit Your Review
        </CardTitle>
        <CardDescription>
          Share your experience with this tool. Your review will be published after approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metric Ratings */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-4">Rate Each Metric</h4>
              <div className="space-y-6">
                {genreCriteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`metric-${criterion.metricKey}`} className="text-sm font-medium">
                        {criterion.metricIcon && (
                          <span className="mr-2">{criterion.metricIcon}</span>
                        )}
                        {criterion.metricLabel}
                      </Label>
                      <Badge 
                        variant="secondary" 
                        className="font-bold"
                        style={{
                          backgroundColor: criterion.metricColor ? `${criterion.metricColor}20` : undefined,
                          color: criterion.metricColor || undefined,
                        }}
                      >
                        {metricScores[criterion.metricKey] || 5}/10
                      </Badge>
                    </div>
                    <Slider
                      id={`metric-${criterion.metricKey}`}
                      min={1}
                      max={10}
                      step={1}
                      value={[metricScores[criterion.metricKey] || 5]}
                      onValueChange={(value) => handleScoreChange(criterion.metricKey, value[0])}
                      className="w-full"
                    />
                    <Textarea
                      placeholder={`Optional: Share your thoughts on ${criterion.metricLabel.toLowerCase()}...`}
                      value={metricComments[criterion.metricKey] || ""}
                      onChange={(e) => handleCommentChange(criterion.metricKey, e.target.value)}
                      className="resize-none text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Rating */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="overall-rating" className="text-sm font-semibold">
                  Overall Rating
                </Label>
                <Badge variant="default" className="font-bold">
                  {overallRating}/10
                </Badge>
              </div>
              <Slider
                id="overall-rating"
                min={1}
                max={10}
                step={1}
                value={[overallRating]}
                onValueChange={(value) => setOverallRating(value[0])}
                className="w-full"
              />
            </div>

            {/* Review Text */}
            <div className="space-y-3 pt-4 border-t">
              <Label htmlFor="review-text" className="text-sm font-semibold">
                Your Review (Optional)
              </Label>
              <Textarea
                id="review-text"
                placeholder="Share your overall experience with this tool..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="resize-none min-h-[120px]"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {reviewText.length}/2000 characters
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting || !session?.user}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>

          {!session?.user && (
            <p className="text-sm text-muted-foreground text-center">
              Please{" "}
              <button
                type="button"
                onClick={() => router.push(`/auth?redirect=/tool/${toolId}`)}
                className="text-primary hover:underline font-medium"
              >
                sign in
              </button>{" "}
              to submit a review
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}