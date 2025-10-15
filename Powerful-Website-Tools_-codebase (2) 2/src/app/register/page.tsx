import * as React from "react"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Loader2 } from "lucide-react"
import { RegisterForm } from "./register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <SiteHeader showAuth={false} />

      <React.Suspense
        fallback={
          <div className="min-h-dvh bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <RegisterForm />
      </React.Suspense>

      <SiteFooter />
    </div>
  )
}