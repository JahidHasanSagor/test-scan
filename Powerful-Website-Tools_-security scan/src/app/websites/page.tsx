"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WebsitesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tools?type=website");
  }, [router]);

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}