"use client";

import * as React from "react";
import { motion } from "framer-motion";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { useCustomer } from "autumn-js/react";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building2, Mail, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QuantitySelectionDialog } from "@/components/quantity-selection-dialog";

export default function PricingPage() {
  const { data: session, isPending } = useSession();
  const { checkout, customer, isLoading: customerLoading } = useCustomer();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [quantityDialogOpen, setQuantityDialogOpen] = React.useState(false);
  const [contactFormData, setContactFormData] = React.useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Thank you! We'll get back to you within 24 hours.");
    setContactFormData({ name: "", email: "", company: "", message: "" });
    setIsSubmitting(false);
  };

  const handlePayPerToolClick = () => {
    if (!session?.user && !isPending) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setQuantityDialogOpen(true);
  };

  const handleQuantityConfirm = async (quantity: number) => {
    setLoadingPlan("pay-per-tool");
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      
      // Call custom API endpoint that calculates total before Stripe
      const res = await fetch("/api/checkout/pay-per-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          quantity,
          successUrl: (() => {
            if (typeof window === "undefined") return undefined;
            const t = localStorage.getItem("bearer_token");
            const u = new URL(window.location.href);
            if (t) u.searchParams.set("token", t);
            u.searchParams.set("success", "true");
            return u.toString();
          })(),
          cancelUrl: (() => {
            if (typeof window === "undefined") return undefined;
            const t = localStorage.getItem("bearer_token");
            const u = new URL(window.location.href);
            if (t) u.searchParams.set("token", t);
            u.searchParams.set("canceled", "true");
            return u.toString();
          })(),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      const url = data?.url;
      if (url) {
        const isInIframe = typeof window !== "undefined" && window.self !== window.top;
        if (isInIframe) {
          window.parent?.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCheckout = async (productId: string) => {
    if (!session?.user && !isPending) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoadingPlan(productId);
    
    try {
      const res = await checkout({
        productId,
        openInNewTab: true,
        successUrl: (() => {
          if (typeof window === "undefined") return undefined;
          const token = localStorage.getItem("bearer_token");
          const u = new URL(window.location.href);
          if (token) u.searchParams.set("token", token);
          return u.toString();
        })(),
        cancelUrl: (() => {
          if (typeof window === "undefined") return undefined;
          const token = localStorage.getItem("bearer_token");
          const u = new URL(window.location.href);
          if (token) u.searchParams.set("token", token);
          return u.toString();
        })(),
      } as any);

      const url = (res as any)?.data?.url;
      if (url) {
        const isInIframe = typeof window !== "undefined" && window.self !== window.top;
        if (isInIframe) {
          window.parent?.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    if (!session?.user) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    try {
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          returnUrl: (() => {
            if (typeof window === "undefined") return undefined;
            const t = localStorage.getItem("bearer_token");
            const u = new URL(window.location.href);
            if (t) u.searchParams.set("token", t);
            return u.toString();
          })(),
        }),
      });
      const data = await res.json();
      const url = data?.url;
      if (url) {
        const isInIframe = typeof window !== "undefined" && window.self !== window.top;
        if (isInIframe) {
          window.parent?.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to open billing portal");
    }
  };

  const currentPlan = customer?.products?.[0]?.id;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader 
        showAuth={false}
        customAuthSlot={
          session?.user ? (
            <ProfileTrigger onClick={() => setSidebarOpen(true)} />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-secondary">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="shadow-sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )
        }
      />
      
      <ProfileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Quantity Selection Dialog */}
      <QuantitySelectionDialog
        open={quantityDialogOpen}
        onOpenChange={setQuantityDialogOpen}
        onConfirm={handleQuantityConfirm}
        productName="Pay-Per-Tool"
        pricePerUnit={1900}
      />

      <main className="container mx-auto px-4 py-12 sm:py-16">
        {/* Hero Section */}
        <motion.div 
          className="mx-auto max-w-4xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
            Choose Your Plan
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Submit and share amazing tools with our community. Start free and upgrade as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="mx-auto max-w-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Plan */}
            <Card className="w-full h-full py-6 text-foreground border rounded-lg shadow-sm">
              <div className="flex flex-col h-full">
                <div className="h-full">
                  <div className="flex flex-col">
                    <div className="pb-4">
                      <h2 className="text-2xl font-semibold px-6">Free</h2>
                      <div className="text-sm text-muted-foreground px-6 h-8">
                        <p className="line-clamp-2">Perfect for trying out</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-semibold h-16 flex px-6 items-center border-y mb-4 bg-secondary/40">
                        <div className="line-clamp-2">
                          $0
                          <span className="font-normal text-muted-foreground ml-2 text-sm">
                            / forever
                          </span>
                        </div>
                      </h3>
                    </div>
                  </div>
                  <div className="flex-grow px-6 mb-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>100 submissions/month</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Community support</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Standard review</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6">
                  <Button variant="secondary" className="w-full" disabled={currentPlan === "free" || currentPlan === undefined}>
                    {currentPlan === "free" || currentPlan === undefined ? "Current Plan" : "Get Started"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Pay-Per-Tool */}
            <Card className="w-full h-full py-6 text-foreground border rounded-lg shadow-sm">
              <div className="flex flex-col h-full">
                <div className="h-full">
                  <div className="flex flex-col">
                    <div className="pb-4">
                      <h2 className="text-2xl font-semibold px-6 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-chart-4" />
                        Pay-Per-Tool
                      </h2>
                      <div className="text-sm text-muted-foreground px-6 h-8">
                        <p className="line-clamp-2">One-time payment</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-semibold h-16 flex px-6 items-center border-y mb-4 bg-secondary/40">
                        <div className="line-clamp-2">
                          $19
                          <span className="font-normal text-muted-foreground ml-2 text-sm">
                            / submission
                          </span>
                        </div>
                      </h3>
                    </div>
                  </div>
                  <div className="flex-grow px-6 mb-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Pay as you go</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>No subscription</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Standard review</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={handlePayPerToolClick}
                    disabled={loadingPlan === "pay-per-tool"}
                  >
                    {loadingPlan === "pay-per-tool" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="w-full h-full py-6 text-foreground border-2 border-primary rounded-lg shadow-lg relative">
              <Badge variant="default" className="absolute -top-3 right-4">
                Popular
              </Badge>
              <div className="flex flex-col h-full">
                <div className="h-full">
                  <div className="flex flex-col">
                    <div className="pb-4">
                      <h2 className="text-2xl font-semibold px-6 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        Pro
                      </h2>
                      <div className="text-sm text-muted-foreground px-6 h-8">
                        <p className="line-clamp-2">Best for power users</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-semibold h-16 flex px-6 items-center border-y mb-4 bg-secondary/40">
                        <div className="line-clamp-2">
                          $99
                          <span className="font-normal text-muted-foreground ml-2 text-sm">
                            / month
                          </span>
                        </div>
                      </h3>
                    </div>
                  </div>
                  <div className="flex-grow px-6 mb-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>100 tools per month</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Priority review (24h)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Premium support</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => currentPlan === "pro" ? handleManageBilling() : handleCheckout("pro")}
                    disabled={loadingPlan === "pro"}
                  >
                    {loadingPlan === "pro" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : currentPlan === "pro" ? (
                      "Manage Billing"
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Enterprise */}
            <Card className="w-full h-full py-6 text-foreground border rounded-lg shadow-sm">
              <div className="flex flex-col h-full">
                <div className="h-full">
                  <div className="flex flex-col">
                    <div className="pb-4">
                      <h2 className="text-2xl font-semibold px-6 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-chart-5" />
                        Enterprise
                      </h2>
                      <div className="text-sm text-muted-foreground px-6 h-8">
                        <p className="line-clamp-2">Custom solution</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-semibold h-16 flex px-6 items-center border-y mb-4 bg-secondary/40">
                        <div className="line-clamp-2 text-sm">
                          Custom Pricing
                        </div>
                      </h3>
                    </div>
                  </div>
                  <div className="flex-grow px-6 mb-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>200+ per month</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Priority review</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Dedicated support</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Custom branding</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 space-y-2">
                  <form onSubmit={handleContactSubmit} className="space-y-2">
                    <Input
                      placeholder="Name"
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="text-sm h-8"
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="text-sm h-8"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full h-9"
                      disabled={isSubmitting}
                    >
                      <Mail className="h-3 w-3 mr-2" />
                      {isSubmitting ? "..." : "Contact Us"}
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Features Comparison */}
        <motion.div 
          className="mx-auto max-w-5xl mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Compare Features
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Free Tier */}
            <div className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <Check className="h-8 w-8 text-chart-2 mb-2" />
                <h3 className="text-lg font-semibold mb-1">Free Tier</h3>
                <p className="text-sm text-muted-foreground">Perfect for trying out</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>100 tool submissions/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>Community support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>Standard review time</span>
                </li>
              </ul>
            </div>

            {/* Pay-Per-Tool */}
            <div className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <Zap className="h-8 w-8 text-chart-4 mb-2" />
                <h3 className="text-lg font-semibold mb-1">Pay-Per-Tool</h3>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>$19 per submission</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>No recurring fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>Standard review time</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="rounded-lg border-2 border-primary bg-card p-6 hover:shadow-lg transition-shadow relative">
              <Badge variant="default" className="absolute -top-3 right-4">
                Popular
              </Badge>
              <div className="mb-4">
                <Crown className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-semibold mb-1">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">Best for power users</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>100 tools per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>Priority review (24h)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>Premium support</span>
                </li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <Building2 className="h-8 w-8 text-chart-5 mb-2" />
                <h3 className="text-lg font-semibold mb-1">Enterprise</h3>
                <p className="text-sm text-muted-foreground">Custom solution</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>200+ submissions per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                  <span>Custom branding</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          className="mx-auto max-w-3xl mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-2">How does the global submission counter work?</h3>
              <p className="text-sm text-muted-foreground">
                The first 100 submissions across all users are free. After that, your first personal submission is still free, but subsequent submissions require payment or a paid plan.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel your Pro plan at any time from your billing portal. You'll retain access until the end of your billing period.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-2">What's the difference between Standard and Priority review?</h3>
              <p className="text-sm text-muted-foreground">
                Standard review takes 24-48 hours, while Priority review (Pro/Enterprise) guarantees review within 24 hours.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-2">How does Pay-Per-Tool work?</h3>
              <p className="text-sm text-muted-foreground">
                Pay $19 per submission when you need it. No subscription required. Perfect for occasional submissions.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}