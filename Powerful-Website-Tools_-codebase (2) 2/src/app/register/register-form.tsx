"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Check, X, AlertCircle } from "lucide-react";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from "@/lib/security/password-validator";
import { sanitizeAuthInput } from "@/lib/security/input-sanitizer";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState<ReturnType<typeof validatePassword> | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const redirectUrl = searchParams.get("redirect") || "/";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate password strength in real-time
    if (name === "password") {
      if (value.length > 0) {
        setPasswordStrength(validatePassword(value));
      } else {
        setPasswordStrength(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitized = sanitizeAuthInput({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      const { data, error } = await authClient.signUp.email({
        email: sanitized.email,
        name: sanitized.name,
        password: formData.password,
      });

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "An account with this email already exists",
        };
        toast.error(errorMap[error.code] || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully!");
      router.push(`/login?registered=true${redirectUrl !== "/" ? `&redirect=${encodeURIComponent(redirectUrl)}` : ""}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Join our community to save tools and more
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="mt-1.5"
                maxLength={100}
              />
            </div>

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
                autoComplete="off"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1.5"
              />
              
              {passwordStrength && formData.password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={`font-medium ${getPasswordStrengthColor(passwordStrength.strength)}`}>
                      {getPasswordStrengthText(passwordStrength.strength)}
                    </span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === 'very-strong' ? 'bg-green-600 w-full' :
                        passwordStrength.strength === 'strong' ? 'bg-blue-600 w-3/4' :
                        passwordStrength.strength === 'medium' ? 'bg-yellow-600 w-1/2' :
                        'bg-red-600 w-1/4'
                      }`}
                    />
                  </div>
                  
                  {passwordStrength.errors.length > 0 && (
                    <div className="space-y-1">
                      {passwordStrength.errors.slice(0, 3).map((error, index) => (
                        <div key={index} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {passwordStrength.isValid && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                      <Check className="w-3 h-3" />
                      <span>Password meets all requirements</span>
                    </div>
                  )}
                </div>
              )}
              
              {!passwordStrength && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Password must contain:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
                    <li>• At least 8 characters</li>
                    <li>• Uppercase and lowercase letters</li>
                    <li>• Numbers and special characters</li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="off"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1.5"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>Passwords do not match</span>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || (passwordStrength !== null && !passwordStrength.isValid)}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="font-medium text-foreground hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}