import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { AuthTabs } from "@/components/auth/auth-tabs";

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <SiteHeader showAuth={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Suspense
          fallback={
            <div className="w-full max-w-md flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <AuthTabs />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}