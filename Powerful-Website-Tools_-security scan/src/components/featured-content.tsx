"use client"

import * as React from "react"
import Image from "next/image"
import { Star, Sparkles, GalleryHorizontal, Gem, FolderOpenDot } from "lucide-react"
import { cn } from "@/lib/utils"
import { truncateWords } from "@/lib/text-utils"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ToolItem = {
  id: string
  title: string
  description: string
  url: string
  image: string
  rating: number
  ratingsCount?: number
  categories: string[]
  ctaLabel?: string
  valueProps?: string[]
}

type FeaturedContentProps = {
  className?: string
  style?: React.CSSProperties
  featured?: {
    toolOfTheWeek?: ToolItem
    mostPopular?: ToolItem[]
    hiddenGems?: ToolItem[]
  }
  onAddToCollection?: (tool: ToolItem) => void
}

function clampRating(r: number) {
  return Math.max(0, Math.min(5, Math.round(r * 2) / 2))
}

function RatingStars({ rating, label }: { rating: number; label?: string }) {
  const rounded = clampRating(rating)
  const full = Math.floor(rounded)
  const half = rounded - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div className="flex items-center gap-1" aria-label={label ?? `Rated ${rounded} out of 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-chart-4 text-chart-4" aria-hidden="true" />
      ))}
      {half && (
        <div className="relative h-4 w-4" aria-hidden="true">
          <Star className="absolute inset-0 h-4 w-4 text-chart-4" />
          <Star className="absolute inset-0 h-4 w-4 fill-chart-4 text-chart-4 [clip-path:inset(0_50%_0_0)]" />
        </div>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      ))}
    </div>
  )
}

function ToolCard({
  tool,
  layout = "default",
  onAdd,
}: {
  tool: ToolItem
  layout?: "default" | "horizontal" | "compact"
  onAdd?: (tool: ToolItem) => void
}) {
  const imageAlt = `${tool.title} preview`
  const ValueProps = (
    <ul className="mt-2 grid w-full max-w-full list-disc gap-1 pl-5 text-sm text-foreground/80">
      {(tool.valueProps ?? []).slice(0, 3).map((vp, i) => (
        <li key={i} className="break-words">
          {vp}
        </li>
      ))}
    </ul>
  )

  if (layout === "horizontal") {
    return (
      <Card
        className="group relative overflow-hidden rounded-[var(--radius)] border-border bg-gradient-to-tr from-chart-5/10 via-card to-chart-3/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        role="article"
        aria-labelledby={`tool-${tool.id}-title`}
      >
        <div className="relative flex min-w-0 items-stretch gap-5 p-5">
          {/* decorative glow */}
          <div className="pointer-events-none absolute -inset-12 -z-10 rounded-[2rem] bg-gradient-to-tr from-chart-3/10 via-transparent to-chart-5/10 blur-3xl" />

          <div className="self-start relative h-10 w-10 shrink-0">
            <Image
              src={tool.image}
              alt={`${tool.title} logo`}
              fill
              className="rounded-md border border-border object-cover bg-secondary"
              sizes="40px"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <h3 id={`tool-${tool.id}-title`} className="min-w-0 truncate font-display text-base font-semibold">
                {tool.title}
              </h3>
              <div className="flex shrink-0 items-center gap-1">
                <RatingStars rating={tool.rating} />
                <span className="text-xs text-muted-foreground">
                  {tool.rating.toFixed(1)}
                  {tool.ratingsCount ? ` · ${Intl.NumberFormat().format(tool.ratingsCount)}` : ""}
                </span>
              </div>
            </div>
            <p className="mt-2 line-clamp-3 break-words text-sm text-muted-foreground/90">
              {truncateWords(tool.description, 150)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {tool.categories.slice(0, 3).map((c) => (
                <Badge key={c} variant="secondary" className="bg-secondary/90 text-foreground">
                  {c}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Visit ${tool.title}`}
              >
                {tool.ctaLabel ?? "Visit"}
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAdd?.(tool)}
                className="gap-1.5 rounded-full backdrop-blur-sm"
                aria-label={`Add ${tool.title} to collection`}
              >
                <FolderOpenDot className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (layout === "compact") {
    return (
      <Card
        className="group relative overflow-hidden rounded-[var(--radius)] border-border bg-card transition-shadow duration-300 hover:shadow-md"
        role="article"
        aria-labelledby={`tool-${tool.id}-title`}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src={tool.image}
                alt={`${tool.title} logo`}
                fill
                className="rounded-md border border-border object-cover bg-secondary"
                sizes="40px"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 id={`tool-${tool.id}-title`} className="min-w-0 flex-1 truncate font-display text-sm font-semibold">
              {tool.title}
            </h3>
            <div className="flex items-center gap-1">
              <RatingStars rating={tool.rating} />
              <span className="text-xs text-muted-foreground">{tool.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground break-words">{truncateWords(tool.description, 150)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {tool.categories.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary" className="bg-secondary text-foreground">
                {c}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2 p-4 pt-0">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Visit ${tool.title}`}
          >
            {tool.ctaLabel ?? "Visit"}
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAdd?.(tool)}
            className="gap-1.5 rounded-full text-foreground hover:bg-secondary"
            aria-label={`Add ${tool.title} to collection`}
          >
            <FolderOpenDot className="h-4 w-4" />
            Save
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      className="group relative overflow-hidden rounded-[var(--radius)] border-border bg-card transition-shadow duration-300 hover:shadow-lg"
      role="article"
      aria-labelledby={`tool-${tool.id}-title`}
    >
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src={tool.image}
              alt={`${tool.title} logo`}
              fill
              className="rounded-md border border-border object-cover bg-secondary"
              sizes="48px"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={`tool-${tool.id}-title`} className="break-words font-display text-lg font-semibold">
              {tool.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground break-words">{tool.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <div className="flex items-center gap-2">
              <RatingStars rating={tool.rating} />
              <span className="text-sm font-medium text-foreground">{tool.rating.toFixed(1)}</span>
            </div>
            {tool.ratingsCount ? (
              <span className="text-xs text-muted-foreground">
                {Intl.NumberFormat().format(tool.ratingsCount)} reviews
              </span>
            ) : null}
          </div>
        </div>
        {tool.valueProps && tool.valueProps.length > 0 ? ValueProps : null}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 p-5 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          {tool.categories.slice(0, 4).map((c) => (
            <Badge key={c} variant="secondary" className="bg-secondary text-foreground">
              {c}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Visit ${tool.title}`}
          >
            {tool.ctaLabel ?? "Visit"}
          </a>
          <Button
            variant="outline"
            onClick={() => onAdd?.(tool)}
            className="gap-2 rounded-full"
            aria-label={`Add ${tool.title} to collection`}
          >
            <FolderOpenDot className="h-4 w-4" />
            Save
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

const DEFAULT_FEATURED: ToolItem[] = [
  {
    id: "1",
    title: "Notion AI",
    description: "Transform scattered notes into organized knowledge with AI-powered workspace.",
    url: "https://notion.so",
    image: "",
    rating: 4.7,
    ratingsCount: 1248,
    categories: ["Productivity", "AI", "Workspace"],
    ctaLabel: "Try for Free",
    valueProps: [
      "Transform scattered notes into organized knowledge",
      "AI-powered workspace with smart organization",
      "Real-time collaboration and version history",
    ],
  },
  {
    id: "2",
    title: "Figma AI",
    description: "Generate design components and prototypes with AI-powered suggestions.",
    url: "https://figma.com",
    image: "",
    rating: 4.8,
    ratingsCount: 3210,
    categories: ["Design", "AI", "Prototyping"],
    ctaLabel: "Explore",
    valueProps: ["Generate design components", "Create prototypes with AI", "Smart design suggestions"],
  },
  {
    id: "3",
    title: "Canva AI",
    description: "Create stunning visuals with AI-powered design tools and templates.",
    url: "https://canva.com",
    image: "",
    rating: 4.6,
    ratingsCount: 2094,
    categories: ["Design", "AI", "Marketing"],
    ctaLabel: "Create Now",
    valueProps: ["AI-powered design tools", "Beautiful templates", "Easy-to-use interface"],
  },
  {
    id: "4",
    title: "Grammarly AI",
    description: "Improve writing quality with AI-powered grammar, style, and tone suggestions.",
    url: "https://grammarly.com",
    image: "",
    rating: 4.9,
    ratingsCount: 980,
    categories: ["Productivity", "AI", "Writing"],
    ctaLabel: "Improve Writing",
    valueProps: ["Grammar and spelling corrections", "Style and tone suggestions", "Professional feedback"],
  },
  {
    id: "5",
    title: "Trello AI",
    description: "Organize tasks and projects with AI-powered workflow automation.",
    url: "https://trello.com",
    image: "",
    rating: 4.5,
    ratingsCount: 1520,
    categories: ["Productivity", "AI", "Project Management"],
    ctaLabel: "Start Organizing",
    valueProps: ["AI-powered workflow automation", "Smart task assignments", "Real-time collaboration"],
  },
  {
    id: "6",
    title: "Slack AI",
    description: "Enhance team communication with AI-powered message summarization and search.",
    url: "https://slack.com",
    image: "",
    rating: 4.4,
    ratingsCount: 310,
    categories: ["Communication", "AI", "Teamwork"],
    ctaLabel: "Join Team",
    valueProps: ["AI-powered message summarization", "Smart search and filtering", "Team collaboration tools"],
  },
  {
    id: "7",
    title: "Zoom AI",
    description: "Improve video conferencing with AI-powered transcription and meeting notes.",
    url: "https://zoom.us",
    image: "",
    rating: 4.3,
    ratingsCount: 118,
    categories: ["Communication", "AI", "Video Conferencing"],
    ctaLabel: "Start Meeting",
    valueProps: ["AI-powered transcription", "Meeting notes and summaries", "Real-time translation"],
  },
  {
    id: "8",
    title: "Google AI",
    description: "Enhance productivity with AI-powered search, organization, and automation.",
    url: "https://google.com",
    image: "",
    rating: 4.5,
    ratingsCount: 264,
    categories: ["Productivity", "AI", "Search"],
    ctaLabel: "Start Search",
    valueProps: ["AI-powered search", "Smart organization", "Automation tools"],
  },
  {
    id: "9",
    title: "Microsoft AI",
    description: "Boost productivity with AI-powered tools across Office applications.",
    url: "https://microsoft.com",
    image: "",
    rating: 4.2,
    ratingsCount: 89,
    categories: ["Productivity", "AI", "Office"],
    ctaLabel: "Start Office",
    valueProps: ["AI-powered Office tools", "Smart document processing", "Real-time collaboration"],
  },
  {
    id: "10",
    title: "Apple AI",
    description: "Enhance creativity with AI-powered tools across Apple ecosystem.",
    url: "https://apple.com",
    image: "",
    rating: 4.1,
    ratingsCount: 76,
    categories: ["Creativity", "AI", "Ecosystem"],
    ctaLabel: "Start Creative",
    valueProps: ["AI-powered creativity tools", "Smart content generation", "Ecosystem integration"],
  },
  {
    id: "11",
    title: "Adobe AI",
    description: "Transform creative work with AI-powered design, editing, and content generation.",
    url: "https://adobe.com",
    image: "",
    rating: 4.4,
    ratingsCount: 141,
    categories: ["Design", "AI", "Creativity"],
    ctaLabel: "Start Creative",
    valueProps: ["AI-powered design tools", "Smart editing features", "Content generation"],
  },
]

export default function FeaturedContent({
  className,
  style,
  featured,
  onAddToCollection,
}: FeaturedContentProps) {
  const [data, setData] = React.useState(DEFAULT_FEATURED);
  const [isLoading, setIsLoading] = React.useState(true);
  const popularRef = React.useRef<HTMLDivElement>(null);

  // Fetch featured tools from API
  React.useEffect(() => {
    const fetchFeaturedTools = async () => {
      if (featured) {
        setData({
          toolOfTheWeek: featured.toolOfTheWeek ?? DEFAULT_FEATURED[0],
          mostPopular: featured.mostPopular ?? DEFAULT_FEATURED.slice(1, 5),
          hiddenGems: featured.hiddenGems ?? DEFAULT_FEATURED.slice(5),
        });
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("bearer_token");
        
        // Fetch featured tools (for Tool of the Week)
        const featuredResponse = await fetch("/api/tools/featured?limit=1", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // Fetch popular tools (approved, sorted by popularity)
        const popularResponse = await fetch("/api/tools?limit=4&sort=popularity", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        let featuredTool = DEFAULT_FEATURED[0];
        let popularTools = DEFAULT_FEATURED.slice(1, 5);

        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          // API returns array directly
          if (featuredData.length > 0) {
            const tool = featuredData[0];
            featuredTool = {
              id: tool.id.toString(),
              title: tool.title,
              description: tool.description,
              url: tool.url,
              image: tool.image || "",
              rating: 4.7,
              ratingsCount: tool.popularity || 100,
              categories: [tool.category, tool.type].filter(Boolean),
              ctaLabel: "Try for Free",
              valueProps: Array.isArray(tool.features) 
                ? tool.features.slice(0, 3) 
                : [],
            };
          }
        }

        if (popularResponse.ok) {
          const popularData = await popularResponse.json();
          if (Array.isArray(popularData) && popularData.length > 0) {
            popularTools = popularData.slice(0, 4).map((t: any) => ({
              id: t.id.toString(),
              title: t.title,
              description: t.description,
              url: t.url,
              image: t.image || "",
              rating: 4.6,
              ratingsCount: t.popularity || 100,
              categories: [t.category].filter(Boolean),
              ctaLabel: "Explore",
              valueProps: Array.isArray(t.features) ? t.features.slice(0, 2) : [],
            }));
          }
        }

        setData({
          toolOfTheWeek: featuredTool,
          mostPopular: popularTools,
          hiddenGems: DEFAULT_FEATURED.slice(5), // Keep default for now
        });

      } catch (error) {
        console.error("Error fetching featured tools:", error);
        setData(DEFAULT_FEATURED);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTools();
  }, [featured]);

  // Auto-scroll animation for popular tools
  React.useEffect(() => {
    const el = popularRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let raf = 0
    let paused = false
    let dir = 1
    const speed = 0.4 // px per frame

    const step = () => {
      if (!paused) {
        el.scrollLeft += dir * speed
        const max = el.scrollWidth - el.clientWidth
        if (el.scrollLeft >= max - 1) dir = -1
        if (el.scrollLeft <= 0) dir = 1
      }
      raf = requestAnimationFrame(step)
    }

    const onEnter = () => { paused = true }
    const onLeave = () => { paused = false }

    el.addEventListener("mouseenter", onEnter)
    el.addEventListener("mouseleave", onLeave)
    el.addEventListener("touchstart", onEnter, { passive: true } as EventListenerOptions)
    el.addEventListener("touchend", onLeave)

    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("mouseenter", onEnter)
      el.removeEventListener("mouseleave", onLeave)
      el.removeEventListener("touchstart", onEnter as any)
      el.removeEventListener("touchend", onLeave)
    }
  }, [])

  if (isLoading) {
    return (
      <section className={cn("w-full rounded-[var(--radius)] bg-background", className)} style={style}>
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-muted-foreground">Loading featured content...</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("w-full rounded-[var(--radius)] bg-background", className)}
      style={style}
      aria-label="Featured content"
    >
      {/* Tool of the Week */}
      <div className="w-full">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent">
            <Sparkles className="h-5 w-5 text-foreground" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">Tool of the Week</h2>
            <p className="text-sm text-muted-foreground">
              Featured by our editors for maximum impact and value.
            </p>
          </div>
        </div>
        <ToolCard tool={data.toolOfTheWeek} onAdd={onAddToCollection} />
      </div>

      {/* Most Popular This Month */}
      <div className="mt-10 w-full">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
              <GalleryHorizontal className="h-5 w-5 text-foreground" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold sm:text-xl">Most Popular This Month</h3>
              <p className="text-sm text-muted-foreground">Trending tools loved by our community.</p>
            </div>
          </div>
        </div>
        <div className="relative">
          {/* edge gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
          <div
            ref={popularRef}
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {data.mostPopular.map((tool) => (
              <div key={tool.id} className="min-w-[320px] max-w-[420px] flex-1 snap-start">
                <ToolCard tool={tool} layout="horizontal" onAdd={onAddToCollection} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Gems */}
      <div className="mt-10 w-full">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-badge-new-bg">
            <Gem className="h-5 w-5 text-success" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold sm:text-xl">Hidden Gems</h3>
            <p className="text-sm text-muted-foreground">
              Underrated tools with standout capabilities worth exploring.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.hiddenGems.map((tool) => (
            <ToolCard key={tool.id} tool={tool} layout="compact" onAdd={onAddToCollection} />
          ))}
        </div>
      </div>
    </section>
  )
}