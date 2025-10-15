"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Loader2 } from "lucide-react";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  React.useEffect(() => {
    if (!isPending && (!session?.user || session.user.role !== "admin")) {
      router.push(`/auth?redirect=${encodeURIComponent("/admin")}`);
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}