"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
// import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { useCustomer } from "autumn-js/react";
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar";
import Link from "next/link";
import { 
  Sparkles, 
  Zap, 
  AlertCircle, 
  Crown, 
  Loader2, 
  Eye, 
  Settings, 
  Palette,
  Video,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  Info,
  Layout,
  User,
  ImagePlus,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { toast } from "sonner";
import CheckoutDialog from "@/components/autumn/checkout-dialog";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from "next/dynamic";

const SiteHeaderNoSSR = dynamic(() => import("@/components/site-header"), { ssr: false });

const CATEGORIES = ['Design', 'Development', 'Marketing', 'Productivity', 'AI', 'Analytics'];
const PRICING_OPTIONS = ['free', 'paid', 'freemium'];
const TOOL_TYPES = ['Web App', 'Browser Extension', 'API', 'Mobile App'];

export default function SubmitPage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();
  const { customer, isLoading: customerLoading, checkout } = useCustomer();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [globalStats, setGlobalStats] = React.useState<{ globalCount: number; userHasFirstFree: boolean } | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"basic" | "preview">("basic");
  const [isMounted, setIsMounted] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    url: "",
    category: "",
    pricing: "",
    type: "",
    image: "",
    features: "",
    ctaText: "",
    // Additional images for gallery
    screenshotUrls: "",
    // Premium fields
    isPremium: false,
    videoUrl: "",
    extendedDescription: "",
    // Developer/Company info
    developerName: "",
    developerWebsite: "",
    developerDescription: "",
    // Release/Version info
    versionNumber: "",
    releaseNotes: "",
    // Pros & Cons
    prosFeatures: "",
    consFeatures: "",
  });

  // Ensure client-side only rendering for auth-dependent UI
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch global submission stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/submission-status");
        if (res.ok) {
          const data = await res.json();
          setGlobalStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please log in to submit a tool");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");
      
      // Parse features
      const featuresArray = formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      // Parse screenshot URLs
      const screenshotUrlsArray = formData.screenshotUrls
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      // Parse pros and cons
      const prosArray = formData.prosFeatures
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const consArray = formData.consFeatures
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      // Combine features with additional metadata
      const enhancedFeatures = [
        ...featuresArray,
        ...(formData.developerName ? [`developer:${formData.developerName}`] : []),
        ...(formData.developerWebsite ? [`developer_website:${formData.developerWebsite}`] : []),
        ...(formData.developerDescription ? [`developer_desc:${formData.developerDescription}`] : []),
        ...(formData.versionNumber ? [`version:${formData.versionNumber}`] : []),
        ...(formData.releaseNotes ? [`release_notes:${formData.releaseNotes}`] : []),
        ...(screenshotUrlsArray.length > 0 ? [`screenshots:${screenshotUrlsArray.join("|")}`] : []),
        ...(prosArray.length > 0 ? [`pros:${prosArray.join("|")}`] : []),
        ...(consArray.length > 0 ? [`cons:${consArray.join("|")}`] : []),
      ];

      const payload: any = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        category: formData.category,
        pricing: formData.pricing,
        type: formData.type,
        image: formData.image || undefined,
        features: enhancedFeatures.length > 0 ? enhancedFeatures : null,
        submittedByUserId: session.user.id,
        ctaText: formData.ctaText || undefined,
      };

      // Add premium fields if enabled
      if (formData.isPremium) {
        payload.isPremium = true;
        payload.videoUrl = formData.videoUrl || undefined;
        payload.extendedDescription = formData.extendedDescription || undefined;
      }

      const res = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 402) {
        toast.error(data.message || "Payment required for this submission");
        setTimeout(() => {
          router.push("/pricing");
        }, 2000);
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Failed to submit tool");
        return;
      }

      toast.success("Tool submitted successfully! It will be reviewed shortly.");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        url: "",
        category: "",
        pricing: "",
        type: "",
        image: "",
        features: "",
        ctaText: "",
        screenshotUrls: "",
        isPremium: false,
        videoUrl: "",
        extendedDescription: "",
        developerName: "",
        developerWebsite: "",
        developerDescription: "",
        versionNumber: "",
        releaseNotes: "",
        prosFeatures: "",
        consFeatures: "",
      });

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred while submitting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmitFree = React.useMemo(() => {
    if (!globalStats) return false;
    if (globalStats.globalCount < 100) return true;
    if (!globalStats.userHasFirstFree) return true;
    return false;
  }, [globalStats]);

  const requiresPayment = !canSubmitFree && !customerLoading && !customer?.products?.some(p => p.id === "pro" || p.id === "enterprise");
  const isPro = customer?.products?.some(p => p.id === "pro" || p.id === "enterprise");
  const remainingSubmissions = customer?.features?.tool_submissions?.balance || 0;

  // Render a stable placeholder on server and first client render to avoid hydration mismatch
  if (!isMounted) {
    return <div className="min-h-dvh bg-background text-foreground" />;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground" suppressHydrationWarning>
      <SiteHeaderNoSSR
        showAuth={false}
        customAuthSlot={
          isMounted && !authPending
            ? session?.user
              ? <ProfileTrigger onClick={() => setSidebarOpen(true)} />
              : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" className="hover:bg-secondary">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="shadow-sm">Sign up</Button>
                    </Link>
                  </div>
                )
            : undefined
        }
      />

      <ProfileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-8 text-center"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Share Your Discovery
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">
              Submit a Tool
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Provide complete information for both listing cards and the detailed tool page
            </p>
          </motion.div>

          {/* Info Alert */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Complete all sections to create a comprehensive tool listing. Your information will appear on both the card view (in listings) and the detailed individual tool page.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Submission Status Card */}
          {!loadingStats && session?.user && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-8 border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {canSubmitFree ? (
                        <div className="h-12 w-12 rounded-full bg-chart-2/20 flex items-center justify-center">
                          <Zap className="h-6 w-6 text-chart-2" />
                        </div>
                      ) : isPro ? (
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Crown className="h-6 w-6 text-primary" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-chart-4/20 flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-chart-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">
                        {canSubmitFree ? "Free Submission Available!" : isPro ? "Pro Plan Active" : "Payment Required"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {canSubmitFree
                          ? globalStats!.globalCount < 100
                            ? `Global free submissions: ${globalStats!.globalCount}/100 used`
                            : "This is your first submission - it's free!"
                          : isPro
                          ? `You have ${remainingSubmissions} submissions remaining this month`
                          : "You've used your free submission. Upgrade to Pro for unlimited submissions."}
                      </p>
                      {!canSubmitFree && !isPro && (
                        <Link href="/pricing">
                          <Button size="sm" className="shadow-sm">
                            View Plans
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "basic" | "preview")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="basic" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Customize
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Basic Information
                        </CardTitle>
                        <CardDescription>
                          Essential details shown on card view and detail page
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">
                            Tool Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="title"
                            placeholder="e.g., Figma, ChatGPT, Notion"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({ ...formData, title: e.target.value })
                            }
                            required
                            maxLength={200}
                          />
                          <p className="text-xs text-muted-foreground">
                            Appears as heading on both card and detail page
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Short Description <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Briefly describe what this tool does..."
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            required
                            maxLength={1000}
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.description.length}/1000 • Shown on card preview and detail page hero
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="url">
                            Website URL <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com"
                            value={formData.url}
                            onChange={(e) =>
                              setFormData({ ...formData, url: e.target.value })
                            }
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Primary link for "Visit Tool" buttons
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ctaText">
                            Call-to-Action Text
                          </Label>
                          <Input
                            id="ctaText"
                            placeholder="e.g., Try for Free, Get Started, Learn More"
                            value={formData.ctaText}
                            onChange={(e) =>
                              setFormData({ ...formData, ctaText: e.target.value })
                            }
                            maxLength={50}
                          />
                          <p className="text-xs text-muted-foreground">
                            Custom button text (defaults to "Visit Tool")
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Visual Assets */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Visual Assets
                        </CardTitle>
                        <CardDescription>
                          Images and media for card thumbnails and detail page gallery
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="image" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Logo/Primary Image URL <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="image"
                            type="url"
                            placeholder="https://example.com/logo.png"
                            value={formData.image}
                            onChange={(e) =>
                              setFormData({ ...formData, image: e.target.value })
                            }
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Main image shown on cards and detail page header
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="screenshotUrls" className="flex items-center gap-2">
                            <ImagePlus className="h-4 w-4" />
                            Additional Screenshots
                          </Label>
                          <Textarea
                            id="screenshotUrls"
                            placeholder="https://example.com/screenshot1.png, https://example.com/screenshot2.png"
                            value={formData.screenshotUrls}
                            onChange={(e) =>
                              setFormData({ ...formData, screenshotUrls: e.target.value })
                            }
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Comma-separated URLs for gallery on detail page (up to 5 recommended)
                          </p>
                        </div>

                        {/* Premium Video Field */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="videoUrl" className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Video Demo URL
                            </Label>
                            {!formData.isPremium && (
                              <Badge variant="secondary" className="gap-1">
                                <Crown className="h-3 w-3" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          <Input
                            id="videoUrl"
                            type="url"
                            placeholder="https://youtube.com/watch?v=..."
                            value={formData.videoUrl}
                            onChange={(e) =>
                              setFormData({ ...formData, videoUrl: e.target.value })
                            }
                            disabled={!formData.isPremium}
                          />
                          <p className="text-xs text-muted-foreground">
                            Featured in gallery section on detail page
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Categorization */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Layout className="h-5 w-5" />
                          Categorization
                        </CardTitle>
                        <CardDescription>
                          Help users find your tool through filtering
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">
                              Category <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
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

                          <div className="space-y-2">
                            <Label htmlFor="pricing">
                              Pricing <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={formData.pricing}
                              onValueChange={(value) =>
                                setFormData({ ...formData, pricing: value })
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRICING_OPTIONS.map((price) => (
                                  <SelectItem key={price} value={price}>
                                    {price.charAt(0).toUpperCase() + price.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="type">
                              Type <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={formData.type}
                              onValueChange={(value) =>
                                setFormData({ ...formData, type: value })
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {TOOL_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="features">Key Features</Label>
                          <Textarea
                            id="features"
                            placeholder="Real-time collaboration, AI-powered suggestions, Cross-platform support"
                            value={formData.features}
                            onChange={(e) =>
                              setFormData({ ...formData, features: e.target.value })
                            }
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Comma-separated list shown in Features section on detail page
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Developer Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Developer Information
                        </CardTitle>
                        <CardDescription>
                          Shown in "About the Developer" section on detail page
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="developerName">
                            Developer/Company Name
                          </Label>
                          <Input
                            id="developerName"
                            placeholder="e.g., Acme Corporation, John Doe"
                            value={formData.developerName}
                            onChange={(e) =>
                              setFormData({ ...formData, developerName: e.target.value })
                            }
                            maxLength={100}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="developerWebsite">
                            Developer Website
                          </Label>
                          <Input
                            id="developerWebsite"
                            type="url"
                            placeholder="https://developer-site.com"
                            value={formData.developerWebsite}
                            onChange={(e) =>
                              setFormData({ ...formData, developerWebsite: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="developerDescription">
                            Developer Bio
                          </Label>
                          <Textarea
                            id="developerDescription"
                            placeholder="Brief description about the developer or company..."
                            value={formData.developerDescription}
                            onChange={(e) =>
                              setFormData({ ...formData, developerDescription: e.target.value })
                            }
                            rows={3}
                            maxLength={500}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.developerDescription.length}/500
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Version/Release Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Version & Release Info</CardTitle>
                        <CardDescription>
                          Displayed in "What's New" section on detail page
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="versionNumber">
                            Current Version
                          </Label>
                          <Input
                            id="versionNumber"
                            placeholder="e.g., 2.5.0, v1.0.8"
                            value={formData.versionNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, versionNumber: e.target.value })
                            }
                            maxLength={20}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="releaseNotes">
                            Release Notes
                          </Label>
                          <Textarea
                            id="releaseNotes"
                            placeholder="What's new in this version? Bug fixes, improvements, new features..."
                            value={formData.releaseNotes}
                            onChange={(e) =>
                              setFormData({ ...formData, releaseNotes: e.target.value })
                            }
                            rows={4}
                            maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.releaseNotes.length}/1000
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pros & Cons Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5 text-chart-2" />
                          Pros & Cons
                        </CardTitle>
                        <CardDescription>
                          Help users make informed decisions by highlighting strengths and limitations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="prosFeatures" className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-chart-2" />
                            Advantages & Strengths
                          </Label>
                          <Textarea
                            id="prosFeatures"
                            placeholder="e.g., Intuitive interface, Fast performance, Great customer support, Affordable pricing"
                            value={formData.prosFeatures}
                            onChange={(e) =>
                              setFormData({ ...formData, prosFeatures: e.target.value })
                            }
                            rows={4}
                            maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.prosFeatures.length}/1000 • Comma-separated list of positive aspects
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="consFeatures" className="flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4 text-chart-4" />
                            Limitations & Considerations
                          </Label>
                          <Textarea
                            id="consFeatures"
                            placeholder="e.g., Limited integrations, Steep learning curve, No mobile app, Expensive for small teams"
                            value={formData.consFeatures}
                            onChange={(e) =>
                              setFormData({ ...formData, consFeatures: e.target.value })
                            }
                            rows={4}
                            maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.consFeatures.length}/1000 • Comma-separated list of areas for improvement
                          </p>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            <strong>Tip:</strong> Be honest and balanced. Users appreciate transparency about both strengths and limitations.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>

                    {/* Premium Features */}
                    <Card className="border-primary/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Crown className="h-5 w-5 text-primary" />
                              Premium Features
                            </CardTitle>
                            <CardDescription>
                              Enhanced listing with priority placement
                            </CardDescription>
                          </div>
                          <Switch
                            checked={formData.isPremium}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, isPremium: checked })
                            }
                          />
                        </div>
                      </CardHeader>
                      <AnimatePresence>
                        {formData.isPremium && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <CardContent className="space-y-4 pt-0">
                              <div className="rounded-lg bg-primary/5 p-4 space-y-2">
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                  <p className="text-sm">Featured badge on your listing</p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                  <p className="text-sm">Video demo in gallery</p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                  <p className="text-sm">Extended description section</p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                  <p className="text-sm">Priority placement in search results</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="extendedDescription">
                                  Extended Description
                                </Label>
                                <Textarea
                                  id="extendedDescription"
                                  placeholder="Provide a detailed description of your tool, its use cases, benefits, unique features, target audience, and success stories..."
                                  value={formData.extendedDescription}
                                  onChange={(e) =>
                                    setFormData({ ...formData, extendedDescription: e.target.value })
                                  }
                                  rows={8}
                                  maxLength={5000}
                                />
                                <p className="text-xs text-muted-foreground">
                                  {formData.extendedDescription.length}/5000 • Shown as dedicated section on detail page
                                </p>
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full shadow-sm gradient-ai text-white"
                      size="lg"
                      disabled={isSubmitting || authPending || (requiresPayment && !canSubmitFree)}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : requiresPayment && !canSubmitFree ? (
                        "Payment Required - View Plans"
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Submit Tool for Review
                        </>
                      )}
                    </Button>

                    {requiresPayment && !canSubmitFree && (
                      <p className="text-xs text-center text-muted-foreground">
                        You need a paid plan to submit more tools.{" "}
                        <Link href="/pricing" className="underline hover:text-foreground">
                          View pricing options
                        </Link>
                      </p>
                    )}
                  </form>
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  {/* Preview content - shown on mobile as tab */}
                  <Card className="lg:hidden">
                    <CardHeader>
                      <CardTitle className="text-lg">Preview</CardTitle>
                      <CardDescription>
                        See how your tool will appear
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ToolPreview formData={formData} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Right: Live Preview (Desktop Only) */}
            <motion.div
              className="hidden lg:block sticky top-8 h-fit"
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    See how your tool will appear to users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ToolPreview formData={formData} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

// Tool Preview Component
function ToolPreview({ formData }: { formData: any }) {
  const hasContent = formData.title || formData.description;
  const screenshotUrls = formData.screenshotUrls
    .split(",")
    .map((url: string) => url.trim())
    .filter((url: string) => url.length > 0);

  const prosArray = formData.prosFeatures
    .split(",")
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  const consArray = formData.consFeatures
    .split(",")
    .map((c: string) => c.trim())
    .filter((c: string) => c.length > 0);

  if (!hasContent) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
        <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Start filling out the form to see a preview
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card View Preview */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Card View (Listings)</h4>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className="flex-shrink-0">
              {formData.image ? (
                <div className="relative h-14 w-14 rounded-lg border border-border overflow-hidden bg-secondary">
                  <Image
                    src={formData.image}
                    alt={formData.title || "Tool logo"}
                    fill
                    className="object-cover"
                    unoptimized={formData.image.startsWith("data:")}
                  />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-lg border border-border bg-secondary flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-base">
                  {formData.title || "Tool Name"}
                </h3>
                {formData.isPremium && (
                  <Badge variant="secondary" className="gap-1 shrink-0 text-xs">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {formData.description || "Tool description will appear here..."}
              </p>

              <div className="flex flex-wrap items-center gap-1 mb-2">
                {formData.category && (
                  <Badge variant="outline" className="text-xs">
                    {formData.category}
                  </Badge>
                )}
                {formData.pricing && (
                  <Badge variant="secondary" className="text-xs">
                    {formData.pricing}
                  </Badge>
                )}
              </div>

              <Button size="sm" variant="default" className="w-full text-xs h-7">
                {formData.ctaText || "Visit Tool"}
                <ExternalLink className="ml-1.5 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Detail Page Preview */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Detail Page Preview</h4>
        </div>
        <div className="space-y-4">
          {/* Hero Section */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3 mb-3">
              {formData.image && (
                <div className="relative h-16 w-16 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                  <Image
                    src={formData.image}
                    alt={formData.title || "Tool logo"}
                    fill
                    className="object-cover"
                    unoptimized={formData.image.startsWith("data:")}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1">{formData.title || "Tool Name"}</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.category && (
                    <Badge variant="outline" className="text-xs">{formData.category}</Badge>
                  )}
                  {formData.pricing && (
                    <Badge variant="secondary" className="text-xs capitalize">{formData.pricing}</Badge>
                  )}
                  {formData.type && (
                    <Badge variant="outline" className="text-xs">{formData.type}</Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {formData.description || "Description will appear here"}
            </p>
          </div>

          {/* Screenshots Gallery */}
          {(formData.image || screenshotUrls.length > 0 || formData.videoUrl) && (
            <div className="rounded-lg border border-border bg-card p-3">
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">GALLERY</h4>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {formData.videoUrl && formData.isPremium && (
                  <div className="w-20 h-12 shrink-0 rounded border border-primary/50 bg-primary/10 flex items-center justify-center">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                )}
                {screenshotUrls.map((url: string, idx: number) => (
                  <div key={idx} className="relative w-20 h-12 shrink-0 rounded border border-border overflow-hidden bg-secondary">
                    <Image src={url} alt={`Screenshot ${idx + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
                {screenshotUrls.length === 0 && !formData.videoUrl && (
                  <div className="w-20 h-12 shrink-0 rounded border border-dashed border-border bg-muted/30 flex items-center justify-center">
                    <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {formData.features && (
            <div className="rounded-lg border border-border bg-card p-3">
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">FEATURES</h4>
              <div className="space-y-1">
                {formData.features.split(",").slice(0, 3).map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                    <span className="text-xs">{feature.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros & Cons */}
          {(prosArray.length > 0 || consArray.length > 0) && (
            <div className="rounded-lg border border-border bg-card p-3">
              <h4 className="text-xs font-semibold mb-3 text-muted-foreground">PROS & CONS</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pros */}
                {prosArray.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ThumbsUp className="h-3.5 w-3.5 text-chart-2" />
                      <span className="text-xs font-medium text-chart-2">Pros</span>
                    </div>
                    <div className="space-y-1.5">
                      {prosArray.slice(0, 3).map((pro: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <div className="w-1 h-1 bg-chart-2 rounded-full mt-1.5 shrink-0" />
                          <span className="text-xs text-foreground/80">{pro}</span>
                        </div>
                      ))}
                      {prosArray.length > 3 && (
                        <p className="text-xs text-muted-foreground italic">+{prosArray.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cons */}
                {consArray.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ThumbsDown className="h-3.5 w-3.5 text-chart-4" />
                      <span className="text-xs font-medium text-chart-4">Cons</span>
                    </div>
                    <div className="space-y-1.5">
                      {consArray.slice(0, 3).map((con: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <div className="w-1 h-1 bg-chart-4 rounded-full mt-1.5 shrink-0" />
                          <span className="text-xs text-foreground/80">{con}</span>
                        </div>
                      ))}
                      {consArray.length > 3 && (
                        <p className="text-xs text-muted-foreground italic">+{consArray.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Developer Info */}
          {(formData.developerName || formData.developerDescription) && (
            <div className="rounded-lg border border-border bg-card p-3">
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">DEVELOPER</h4>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-chart-5/20 flex items-center justify-center text-xs font-bold shrink-0">
                  {formData.developerName ? formData.developerName.substring(0, 2).toUpperCase() : "??"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{formData.developerName || "Developer Name"}</p>
                  {formData.developerDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {formData.developerDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Version Info */}
          {(formData.versionNumber || formData.releaseNotes) && (
            <div className="rounded-lg border border-border bg-card p-3">
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">WHAT'S NEW</h4>
              {formData.versionNumber && (
                <Badge variant="outline" className="text-xs mb-2">{formData.versionNumber}</Badge>
              )}
              {formData.releaseNotes && (
                <p className="text-xs text-foreground/80 line-clamp-3">{formData.releaseNotes}</p>
              )}
            </div>
          )}

          {/* Extended Description */}
          {formData.isPremium && formData.extendedDescription && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Crown className="h-3 w-3 text-primary" />
                EXTENDED DESCRIPTION
              </h4>
              <p className="text-xs text-foreground/80 line-clamp-4">
                {formData.extendedDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}