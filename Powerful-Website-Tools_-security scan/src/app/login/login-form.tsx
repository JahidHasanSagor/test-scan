"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { sanitizeAuthInput } from "@/lib/security/input-sanitizer";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const redirectUrl = searchParams.get("redirect") || "/";
  const registered = searchParams.get("registered");

  React.useEffect(() => {
    if (registered === "true") {
      toast.success("Account created! Please log in to continue.");
    }
  }, [registered]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitized = sanitizeAuthInput({
        email: formData.email,
        password: formData.password,
      });

      const result = await authClient.signIn.email({
        email: sanitized.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: redirectUrl,
      });

      // Check for errors or missing data
      if (result.error) {
        console.error("Login error:", result.error);
        toast.error(
          "Invalid email or password. Please make sure you have already registered an account and try again."
        );
        setIsLoading(false);
        return;
      }

      // Verify we got valid session data
      if (!result.data?.session) {
        console.error("Login failed: No session data returned");
        toast.error("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Wait for token to be saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Welcome back!");
      
      // Force full page reload to ensure all components get fresh session
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Login exception:", error);
      if (error instanceof Error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Log in to your account to continue</p>
        </div>

        {redirectUrl !== "/" && (
          <div className="mb-4 rounded-lg bg-accent/50 px-4 py-3 text-sm">Please log in to access this page</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, rememberMe: checked === true }))
              }
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href={`/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="font-medium text-foreground hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};