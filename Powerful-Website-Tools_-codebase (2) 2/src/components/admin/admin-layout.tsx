"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Wrench,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Plus,
  ShoppingBag,
  Home,
  User,
  LogOut,
  CreditCard,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const navigation = [
  {
    section: "NAVIGATION",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    section: "PAGES",
    items: [
      {
        name: "Tools",
        href: "/admin/tools",
        icon: Wrench,
      },
      {
        name: "Blog",
        href: "/admin/blog",
        icon: BookOpen,
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
  {
    section: "DATA",
    items: [
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        name: "Security",
        href: "/admin/security",
        icon: Shield,
      },
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

// Flatten navigation for search
const allNavigationItems = navigation.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    section: section.section,
    keywords: [
      item.name.toLowerCase(),
      item.href.toLowerCase(),
      section.section.toLowerCase(),
    ],
  }))
);

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, refetch } = useSession();

  // Filter navigation items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return allNavigationItems;
    
    const query = searchQuery.toLowerCase();
    return allNavigationItems.filter((item) =>
      item.keywords.some((keyword) => keyword.includes(query))
    );
  }, [searchQuery]);

  // Reset selected index when filtered items change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!searchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        router.push(filteredItems[selectedIndex].href);
        setSearchOpen(false);
        setSearchQuery("");
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, filteredItems, selectedIndex, router]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {sidebarOpen ? (
            <>
              <Link href="/" className="flex items-center gap-2">
                <span className="font-display font-bold text-lg bg-gradient-to-r from-chart-5 to-chart-3 bg-clip-text text-transparent">
                  Powerful Websites
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto"
              onClick={() => setSidebarOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {navigation.map((section) => (
            <div key={section.section}>
              {sidebarOpen && (
                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        !sidebarOpen && "justify-center"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen && <span>{item.name}</span>}
                      {isActive && sidebarOpen && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Toggle */}
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            size={sidebarOpen ? "default" : "icon"}
            className={cn("w-full", !sidebarOpen && "mx-auto")}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="ml-2">Collapse</span>
              </>
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </aside>

      {/* Profile Sidebar */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-80 bg-card border-l border-border shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-display">Profile Menu</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setProfileOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-border">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">
                    {session?.user?.name || "Admin User"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-1 mt-2 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {session?.user?.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>

                <nav className="space-y-1">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    <span>Home Page</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>User Dashboard</span>
                  </Link>
                  <Link
                    href="/account/settings"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Account Settings</span>
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Pricing & Billing</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Sidebar */}
      <AnimatePresence>
        {notificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-80 bg-card border-l border-border shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-display">Notifications</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-500/20">
                        <Wrench className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New tool submission</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          A new tool is waiting for approval
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg hover:bg-secondary transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          John Doe just created an account
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay with Command Palette */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            >
              <div className="bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Navigate to... (type to search)"
                      className="pl-10 pr-4 h-12 text-base border-0 focus-visible:ring-0"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {filteredItems.length > 0 ? (
                    <div className="p-2">
                      <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                        Quick Navigation
                      </div>
                      {filteredItems.map((item, index) => {
                        const Icon = item.icon;
                        const isSelected = index === selectedIndex;
                        
                        return (
                          <button
                            key={item.href}
                            onClick={() => handleNavigate(item.href)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                              isSelected
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-secondary text-foreground"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                isSelected
                                  ? "bg-primary/20"
                                  : "bg-muted"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.href}
                              </p>
                            </div>
                            <ArrowRight
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No results found for "{searchQuery}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try searching for dashboard, tools, blog, users, analytics, or settings
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-3 border-t border-border bg-muted/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono">↑</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono">↓</kbd>
                        <span>Navigate</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono">↵</kbd>
                        <span>Select</span>
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono">esc</kbd>
                      <span>Close</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button className="gap-2" size="sm" asChild>
              <Link href="/submit">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add a new Tool</span>
                <span className="sm:hidden">Add Tool</span>
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                1
              </span>
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-white">
                2
              </span>
            </Button>

            <button
              onClick={() => setProfileOpen(true)}
              className="hidden md:flex items-center gap-3 pl-3 border-l border-border hover:bg-secondary/50 rounded-lg pr-2 py-1 transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-semibold leading-none">
                  {session?.user?.name || "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {session?.user?.role === "admin" ? "Administrator" : "User"}
                </p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}