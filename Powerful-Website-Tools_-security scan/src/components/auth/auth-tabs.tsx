"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Check, X, AlertCircle } from "lucide-react";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from "@/lib/security/password-validator";
import { sanitizeAuthInput } from "@/lib/security/input-sanitizer";

export function AuthTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState<string>("login");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSocialLoading, setIsSocialLoading] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState<ReturnType<typeof validatePassword> | null>(null);
  
  const [loginData, setLoginData] = React.useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signupData, setSignupData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const redirectUrl = searchParams.get("redirect") || "/";
  const registered = searchParams.get("registered");

  React.useEffect(() => {
    if (registered === "true") {
      toast.success("Account created! Please log in to continue.");
      setActiveTab("login");
    }
  }, [registered]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    
    // Validate password strength in real-time
    if (name === "password") {
      if (value.length > 0) {
        setPasswordStrength(validatePassword(value));
      } else {
        setPasswordStrength(null);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitized = sanitizeAuthInput({
        email: loginData.email,
        password: loginData.password,
      });

      const { error } = await authClient.signIn.email({
        email: sanitized.email,
        password: loginData.password,
        rememberMe: loginData.rememberMe,
        callbackURL: redirectUrl,
      });

      if (error?.code) {
        toast.error(
          "Invalid email or password. Please make sure you have already registered an account and try again."
        );
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!");
      router.push(redirectUrl);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password confirmation check
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    const validation = validatePassword(signupData.password);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitized = sanitizeAuthInput({
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
      });

      const { error } = await authClient.signUp.email({
        email: sanitized.email,
        name: sanitized.name,
        password: signupData.password,
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
      setActiveTab("login");
      setLoginData({ email: sanitized.email, password: "", rememberMe: false });
      setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
      setPasswordStrength(null);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setIsSocialLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: redirectUrl,
      });
    } catch (error) {
      toast.error(`Failed to sign in with ${provider === "google" ? "Google" : "GitHub"}`);
      setIsSocialLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-lg p-6 sm:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Welcome back</h3>
              <p className="text-sm text-muted-foreground">
                Log in to your account to continue
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("google")}
                disabled={isSocialLoading}
                className="w-full"
              >
                {isSocialLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("github")}
                disabled={isSocialLoading}
                className="w-full"
              >
                {isSocialLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </>
                )}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {redirectUrl !== "/" && (
              <div className="mb-4 rounded-lg bg-accent/50 px-4 py-3 text-sm">
                Please log in to access this page
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={loginData.rememberMe}
                  onCheckedChange={(checked) =>
                    setLoginData((prev) => ({ ...prev, rememberMe: checked === true }))
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
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Create an account</h3>
              <p className="text-sm text-muted-foreground">
                Join our community to save tools and more
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("google")}
                disabled={isSocialLoading}
                className="w-full"
              >
                {isSocialLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("github")}
                disabled={isSocialLoading}
                className="w-full"
              >
                {isSocialLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </>
                )}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={signupData.name}
                  onChange={handleSignupChange}
                  placeholder="John Doe"
                  className="mt-1.5"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={signupData.email}
                  onChange={handleSignupChange}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  required
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="••••••••"
                  className="mt-1.5"
                />
                
                {passwordStrength && signupData.password.length > 0 && (
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
                <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                <Input
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="off"
                  required
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  placeholder="••••••••"
                  className="mt-1.5"
                />
                {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}