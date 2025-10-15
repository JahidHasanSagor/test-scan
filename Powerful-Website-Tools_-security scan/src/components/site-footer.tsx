"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Facebook, Linkedin, Rss, ListTree, LayoutTemplate, UserPlus, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type NavLink = {
  label: string
  href?: string
}

type SocialLink = {
  type: "facebook" | "linkedin" | "rss"
  href?: string
  label?: string
}

export interface SiteFooterProps {
  className?: string
  style?: React.CSSProperties
  brandName?: string
  description?: string
  toolsLinks?: NavLink[]
  categoryLinks?: NavLink[]
  aboutLinks?: NavLink[]
  guidelineLinks?: NavLink[]
  contactEmail?: string
  contactNote?: string
  social?: SocialLink[]
  newsletterTitle?: string
  newsletterSubtitle?: string
  onSubscribe?: (email: string) => Promise<void> | void
}

export default function SiteFooter({
  className,
  style,
  brandName = "Powerful Website You Should Know",
  description = "A curated directory-blog of remarkable tools and websites. Discover, compare, and stay ahead with thoughtfully organized resources and expert insights.",
  toolsLinks = [
    { label: "All Tools", href: "/tools" },
    { label: "Trending", href: "/tools?sort=popularity" },
    { label: "New & Noteworthy", href: "/tools?sort=newest" },
    { label: "Editors' Picks", href: "/tools?featured=true" },
  ],
  categoryLinks = [
    { label: "Browse Categories", href: "/categories" },
    { label: "Design", href: "/tools?category=design" },
    { label: "Development", href: "/tools?category=development" },
    { label: "Marketing", href: "/tools?category=marketing" },
    { label: "AI", href: "/tools?category=ai" },
  ],
  aboutLinks = [
    { label: "Blog", href: "/blog" },
    { label: "Submit Tool", href: "/submit" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  guidelineLinks = [
    { label: "Submission Guidelines", href: "/submit" },
    { label: "How to Submit", href: "/submit" },
  ],
  contactEmail = "hello@example.com",
  contactNote = "We love hearing about great tools, partnerships, and suggestions.",
  social = [
    { type: "facebook", label: "Facebook", href: "https://facebook.com" },
    { type: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    { type: "rss", label: "RSS", href: "/blog" },
  ],
  newsletterTitle = "Get the best new tools in your inbox",
  newsletterSubtitle = "No spam — just occasional, high-signal updates on standout tools and deep-dives.",
  onSubscribe,
}: SiteFooterProps) {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  
  // Force fresh render
  const footerKey = React.useMemo(() => "footer-v2", [])

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    const isValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.length <= 254
    if (!isValid) {
      toast.error("Please enter a valid email address.")
      return
    }
    try {
      setLoading(true)
      if (onSubscribe) {
        await onSubscribe(email.trim())
      } else {
        await new Promise((res) => setTimeout(res, 900))
      }
      setEmail("")
      toast.success("Subscribed! You'll hear from us soon.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const year = React.useMemo(() => new Date().getFullYear(), [])

  function renderLink(item: NavLink) {
    const content = (
      <span className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-all duration-200 group-hover:translate-x-0.5">
        {item.label}
        {item.href?.startsWith("http") && <ExternalLink className="h-3 w-3" />}
      </span>
    )
    if (item.href) {
      return (
        <Link
          href={item.href}
          className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md"
        >
          {content}
        </Link>
      )
    }
    return <span aria-disabled="true">{content}</span>
  }

  function renderSocialIcon(s: SocialLink) {
    const iconClass =
      "h-5 w-5 text-foreground/70 group-hover:text-foreground transition-all duration-300 group-hover:scale-110"
    const Icon =
      s.type === "facebook" ? Facebook : s.type === "linkedin" ? Linkedin : Rss
    const label =
      s.label ?? (s.type === "facebook" ? "Facebook" : s.type === "linkedin" ? "LinkedIn" : "RSS")
    const inner = (
      <span className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border hover:bg-accent hover:border-accent-foreground/20 hover:shadow-md transition-all duration-300">
        <Icon className={iconClass} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    )
    if (s.href) {
      return (
        <Link
          key={s.type}
          href={s.href}
          target={s.href.startsWith("http") ? "_blank" : undefined}
          rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={label}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-full"
        >
          {inner}
        </Link>
      )
    }
    return (
      <span key={s.type} aria-label={label} aria-disabled="true">
        {inner}
      </span>
    )
  }

  return (
    <footer
      key={footerKey}
      suppressHydrationWarning
      className={cn(
        "relative w-full bg-gradient-to-b from-secondary via-secondary to-secondary/80 border-t border-border text-foreground",
        className
      )}
      style={style}
      role="contentinfo"
    >
      <div className="container w-full max-w-full relative z-10">
        <div className="mx-auto w-full max-w-7xl py-12 md:py-16">
          <div className="grid gap-10 md:gap-12 lg:gap-16">
            {/* Top: Brand + Newsletter */}
            <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr] lg:gap-12">
              <div className="min-w-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-chart-1 to-chart-3 shadow-lg">
                    <LayoutTemplate className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {brandName}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                      {description}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <span className="inline-block h-10 w-10 rounded-full ring-2 ring-secondary overflow-hidden bg-gradient-to-br from-chart-2 to-chart-4 border border-border shadow-sm" aria-hidden="true" />
                    <span className="inline-block h-10 w-10 rounded-full ring-2 ring-secondary overflow-hidden bg-gradient-to-br from-chart-3 to-chart-5 border border-border shadow-sm" aria-hidden="true" />
                    <span className="inline-block h-10 w-10 rounded-full ring-2 ring-secondary overflow-hidden bg-gradient-to-br from-chart-4 to-chart-2 border border-border shadow-sm" aria-hidden="true" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trusted by <span className="font-semibold text-foreground">thousands</span> of curious builders
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-gradient-to-br from-chart-2 to-chart-2/80 p-2.5 shadow-sm">
                    <UserPlus className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-bold">
                      {newsletterTitle}
                    </h4>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {newsletterSubtitle}
                    </p>
                  </div>
                </div>
                <form
                  onSubmit={handleSubscribe}
                  className="mt-5 flex flex-col gap-3 sm:flex-row"
                  aria-label="Newsletter subscription"
                >
                  <label htmlFor="footer-email" className="sr-only">
                    Email address
                  </label>
                  <Input
                    id="footer-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary focus:bg-background border-border hover:border-foreground/20 transition-colors"
                    aria-required="true"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="whitespace-nowrap shadow-sm hover:shadow-md transition-all"
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </Button>
                </form>
                <p className="mt-2.5 text-[11px] text-muted-foreground">
                  By subscribing, you agree to our{" "}
                  <span className="underline decoration-from-font underline-offset-2 hover:text-foreground transition-colors cursor-pointer">
                    terms
                  </span>{" "}
                  and{" "}
                  <span className="underline decoration-from-font underline-offset-2 hover:text-foreground transition-colors cursor-pointer">
                    privacy policy
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Middle: Link columns */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <nav aria-label="Tools" className="min-w-0">
                <h5 className="text-sm font-bold uppercase tracking-wide text-foreground mb-1 flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-chart-3" aria-hidden="true" />
                  Tools
                </h5>
                <div className="mb-4 h-0.5 w-12 bg-gradient-to-r from-chart-3 to-transparent rounded-full" />
                <ul className="space-y-3">
                  {toolsLinks.map((item) => (
                    <li key={item.label} className="min-w-0">
                      {renderLink(item)}
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Categories" className="min-w-0">
                <h5 className="text-sm font-bold uppercase tracking-wide text-foreground mb-1 flex items-center gap-2">
                  <ListTree className="h-4 w-4 text-chart-2" aria-hidden="true" />
                  Categories
                </h5>
                <div className="mb-4 h-0.5 w-12 bg-gradient-to-r from-chart-2 to-transparent rounded-full" />
                <ul className="space-y-3">
                  {categoryLinks.map((item) => (
                    <li key={item.label} className="min-w-0">
                      {renderLink(item)}
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="About" className="min-w-0">
                <h5 className="text-sm font-bold uppercase tracking-wide text-foreground mb-1">
                  About
                </h5>
                <div className="mb-4 h-0.5 w-12 bg-gradient-to-r from-chart-4 to-transparent rounded-full" />
                <ul className="space-y-3">
                  {aboutLinks.map((item) => (
                    <li key={item.label} className="min-w-0">
                      {renderLink(item)}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="min-w-0">
                <h5 className="text-sm font-bold uppercase tracking-wide text-foreground mb-1">
                  Submission & Contact
                </h5>
                <div className="mb-4 h-0.5 w-12 bg-gradient-to-r from-chart-5 to-transparent rounded-full" />
                <ul className="space-y-3">
                  {guidelineLinks.map((item) => (
                    <li key={item.label} className="min-w-0">
                      {renderLink(item)}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-semibold mb-1">Get in Touch</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {contactNote}
                  </p>
                  <p className="text-sm mb-3">
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex items-center gap-1.5 text-chart-3 hover:text-chart-3/80 underline decoration-from-font underline-offset-2 transition-colors"
                    >
                      <span className="font-medium">{contactEmail}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                  <div className="flex items-center gap-2">
                    {social.map((s) => renderSocialIcon(s))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Legal */}
            <div className="border-t border-border pt-6 md:pt-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  © {year} <span className="font-semibold text-foreground">{brandName}</span>. All rights reserved.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <SmallLink href="/terms" label="Terms of Service" />
                  <Dot />
                  <SmallLink href="/privacy" label="Privacy Policy" />
                  <Dot />
                  <SmallLink href="/sitemap.xml" label="Sitemap" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </footer>
  )
}

function Dot() {
  return <span aria-hidden="true" className="text-muted-foreground/50">•</span>
}

function SmallLink({ href, label }: { href?: string; label: string }) {
  const content = (
    <span className="text-sm text-foreground/70 hover:text-foreground transition-colors">
      {label}
    </span>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md"
      >
        {content}
      </Link>
    )
  }
  return <span aria-disabled="true">{content}</span>
}