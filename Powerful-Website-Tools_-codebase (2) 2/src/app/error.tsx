"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCcw, MessageCircle, ArrowLeft } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to error reporting service
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-4">
      <div className="mx-auto max-w-2xl w-full">
        {/* Error Icon and Message */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="mb-3 font-display text-4xl font-bold sm:text-5xl">Something Went Wrong</h1>
          <p className="text-lg text-muted-foreground">
            We're sorry, but something unexpected happened. Our team has been notified and we're working on it.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
            <CardDescription>
              An unexpected error occurred while processing your request.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error message in development */}
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-sm font-mono text-destructive">
                  {error.message || "Unknown error"}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Production message */}
            {process.env.NODE_ENV === "production" && error.digest && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  If you continue to experience this issue, please contact support with this error ID:
                </p>
                <p className="mt-2 font-mono text-sm font-semibold">{error.digest}</p>
              </div>
            )}

            {/* What you can do */}
            <div>
              <h3 className="mb-2 font-semibold">What you can do:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Try refreshing the page</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Go back and try again</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Clear your browser cache and cookies</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Try accessing the page in a few minutes</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} size="lg">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Support Link */}
        <div className="mt-8 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Still having issues?
          </p>
          <Link href="/contact">
            <Button variant="link">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}