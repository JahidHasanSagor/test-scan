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
import { Loader2 } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"login" | "signup">("login");
  
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
      setActiveTab("login");
      toast.success("Account created! Please log in to continue.");
    }
  }, [registered]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: loginData.email,
        password: loginData.password,
        rememberMe: loginData.rememberMe,
        callbackURL: redirectUrl,
      });

      if (error?.code) {
        toast.error("Invalid email or password. Please make sure you have registered and try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!");
      router.push(redirectUrl);
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: signupData.email,
        name: signupData.name,
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

      toast.success("Account created successfully! Please log in.");
      setActiveTab("login");
      setLoginData({ email: signupData.email, password: "", rememberMe: false });
      setIsLoading(false);
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <SiteHeader showAuth={false} />
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-sm font-medium">
                Log in
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-sm font-medium">
                Sign up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-lg">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
                  <p className="text-sm text-muted-foreground">
                    Log in to your account to continue
                  </p>
                </div>

                {redirectUrl !== "/" && (
                  <div className="mb-4 rounded-lg bg-accent/50 px-4 py-3 text-sm">
                    Please log in to access this page
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
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
              </div>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-lg">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2">Create an account</h1>
                  <p className="text-sm text-muted-foreground">
                    Join our community to save tools and more
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
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
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AuthForm />
    </React.Suspense>
  );
}