"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Save,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  
  // General Settings
  const [siteName, setSiteName] = React.useState("Powerful Website You Should Know");
  const [siteDescription, setSiteDescription] = React.useState("Discover and explore the best AI tools and websites");
  const [siteUrl, setSiteUrl] = React.useState("https://example.com");
  const [contactEmail, setContactEmail] = React.useState("admin@example.com");
  
  // SEO Settings
  const [metaTitle, setMetaTitle] = React.useState("Powerful Website You Should Know");
  const [metaDescription, setMetaDescription] = React.useState("Discover the best AI tools");
  const [metaKeywords, setMetaKeywords] = React.useState("ai tools, websites, directory");
  const [ogImage, setOgImage] = React.useState("");
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [newSubmissionNotif, setNewSubmissionNotif] = React.useState(true);
  const [newReviewNotif, setNewReviewNotif] = React.useState(true);
  const [newUserNotif, setNewUserNotif] = React.useState(false);
  
  // Feature Flags
  const [allowSubmissions, setAllowSubmissions] = React.useState(true);
  const [allowReviews, setAllowReviews] = React.useState(true);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [requireApproval, setRequireApproval] = React.useState(true);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSEO = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("SEO settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Feature settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your platform settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic site information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Your Site Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Brief description of your site"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveGeneral} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Tags</CardTitle>
              <CardDescription>
                Optimize your site for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Site title for search results"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {metaTitle.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Site description for search results"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of keywords
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Image displayed when shared on social media (1200x630px recommended)
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveSEO} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save SEO Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sitemap & Robots</CardTitle>
              <CardDescription>
                Manage search engine crawling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">XML Sitemap</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically generated sitemap for search engines
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  View Sitemap
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Robots.txt</p>
                  <p className="text-sm text-muted-foreground">
                    Control crawler access to your site
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Edit Robots.txt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when to receive email alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for admin activities
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="pl-6 space-y-4 border-l-2 border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newSubmissionNotif">New Tool Submissions</Label>
                    <p className="text-sm text-muted-foreground">
                      When a new tool is submitted for approval
                    </p>
                  </div>
                  <Switch
                    id="newSubmissionNotif"
                    checked={newSubmissionNotif}
                    onCheckedChange={setNewSubmissionNotif}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newReviewNotif">New Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      When users post new reviews
                    </p>
                  </div>
                  <Switch
                    id="newReviewNotif"
                    checked={newReviewNotif}
                    onCheckedChange={setNewReviewNotif}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newUserNotif">New User Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      When new users sign up
                    </p>
                  </div>
                  <Switch
                    id="newUserNotif"
                    checked={newUserNotif}
                    onCheckedChange={setNewUserNotif}
                    disabled={!emailNotifications}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveNotifications} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Notification Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Management</CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="allowSubmissions">Allow Tool Submissions</Label>
                    <Badge variant={allowSubmissions ? "default" : "secondary"}>
                      {allowSubmissions ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Users can submit new tools to the directory
                  </p>
                </div>
                <Switch
                  id="allowSubmissions"
                  checked={allowSubmissions}
                  onCheckedChange={setAllowSubmissions}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="allowReviews">Allow Reviews</Label>
                    <Badge variant={allowReviews ? "default" : "secondary"}>
                      {allowReviews ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Users can post reviews on tools
                  </p>
                </div>
                <Switch
                  id="allowReviews"
                  checked={allowReviews}
                  onCheckedChange={setAllowReviews}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="requireApproval">Require Manual Approval</Label>
                    <Badge variant={requireApproval ? "default" : "secondary"}>
                      {requireApproval ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tools must be approved before appearing in directory
                  </p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive/5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="maintenanceMode" className="text-destructive">
                      Maintenance Mode
                    </Label>
                    <Badge variant={maintenanceMode ? "destructive" : "outline"}>
                      {maintenanceMode ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Display maintenance page to all visitors
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveFeatures} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Feature Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Platform status and system details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Platform Version</p>
                  <p className="text-lg font-semibold">v2.0.0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Database Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-lg font-semibold">Connected</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Backup</p>
                  <p className="text-lg font-semibold">2 hours ago</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Cache Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-lg font-semibold">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
              <CardDescription>
                Maintenance and optimization tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Clear Cache</p>
                  <p className="text-sm text-muted-foreground">
                    Clear all cached data to free up space
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Clear Cache
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Rebuild Search Index</p>
                  <p className="text-sm text-muted-foreground">
                    Reindex all tools for better search results
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Database className="h-4 w-4" />
                  Rebuild Index
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Export Database</p>
                  <p className="text-sm text-muted-foreground">
                    Download a complete backup of your data
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Database className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}