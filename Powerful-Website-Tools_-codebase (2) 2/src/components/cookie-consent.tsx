"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const dismiss = () => {
    // Treat dismiss as accepting necessary only
    acceptNecessary();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <Card className="max-w-4xl mx-auto pointer-events-auto bg-card/95 backdrop-blur-sm border-2 shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  🍪 We Value Your Privacy
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies to enhance your browsing experience, analyze site traffic, 
                  and personalize content. By clicking "Accept All", you consent to our use 
                  of cookies. You can manage your preferences or learn more in our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  Accept All
                </Button>
                <Button 
                  onClick={acceptNecessary}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  Necessary Only
                </Button>
              </div>
            </div>

            <button
              onClick={dismiss}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}