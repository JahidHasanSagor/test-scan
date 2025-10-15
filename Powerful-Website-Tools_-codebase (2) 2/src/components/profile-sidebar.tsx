"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  LayoutDashboard, 
  Settings, 
  Shield, 
  LogOut, 
  X,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ProfileSidebar({ isOpen, setIsOpen }: ProfileSidebarProps) {
  const router = useRouter();
  const { data: session, refetch } = useSession();

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  if (!session?.user) {
    return null;
  }

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      show: true,
    },
    {
      icon: Settings,
      label: "Account Settings",
      href: "/account/settings",
      show: true,
    },
    {
      icon: Shield,
      label: "Admin Panel",
      href: "/admin",
      show: session.user.role === "admin",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] border-l border-border bg-card shadow-lg z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold">Profile Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                    {session.user.role === "admin" && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left group"
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Profile trigger button component
export function ProfileTrigger({ onClick }: { onClick: () => void }) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="rounded-full px-3 h-10 font-medium hover:bg-secondary"
    >
      <User className="h-4 w-4 mr-2" />
      Hello, {session.user.name?.split(' ')[0] || 'User'}
    </Button>
  );
}