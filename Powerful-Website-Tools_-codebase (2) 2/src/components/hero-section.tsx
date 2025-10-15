"use client";

import React from "react";
import { AutocompleteSearch } from "@/components/ui/autocomplete-search";
import { FolderSearch2, Sparkles, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { buildSearchUrl } from "@/lib/search-service";
import { TrendingTicker } from "@/components/ui/trending-ticker";
import { ToolFinderQuiz } from "@/components/tool-finder-quiz";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const typingWords = ["Tools", "Websites", "AI Tools", "Resources", "Platforms"];

const categories = [
  "AI Tools",
  "Design",
  "Marketing",
  "Productivity",
  "Development",
  "Analytics",
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [displayText, setDisplayText] = React.useState("");
  const [wordIndex, setWordIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isPaused, setPaused] = React.useState(false);
  const [stats, setStats] = React.useState([
    { icon: Eye, label: "Tools Listed", value: "1,200+" },
    { icon: TrendingUp, label: "Active Users", value: "50K+" },
    { icon: Sparkles, label: "AI Powered", value: "Featured" },
  ]);
  const router = useRouter();
  // Defer interactive UI to client after mount to avoid hydration mismatches
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Typewriter effect
  React.useEffect(() => {
    if (isPaused) return;

    const currentWord = typingWords[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentWord.substring(0, displayText.length + 1));
          if (displayText === currentWord) {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          setDisplayText(currentWord.substring(0, displayText.length - 1));
          if (displayText === "") {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % typingWords.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex, isPaused]);

  // Fetch stats from API
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/tools/stats");
        if (res.ok) {
          const data = await res.json();
          setStats([
            { icon: Eye, label: "Tools Listed", value: data.totalTools?.toLocaleString("en-US") || "1,200+" },
            { icon: TrendingUp, label: "Active Users", value: "50K+" },
            { icon: Sparkles, label: "AI Powered", value: "Featured" },
          ]);
        }
      } catch (error) {
        // Use default stats on error
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);
    try {
      // Redirect to search page with query
      const searchUrl = buildSearchUrl({ query: trimmed });
      router.push(searchUrl);
    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(query);
  };

  return (
    <section className="relative overflow-hidden py-8 lg:py-12">
      {/* Container for centered card */}
      <div className="container mx-auto px-4">
        {/* Card with gradient border and background */}
        <div className="relative mx-auto max-w-5xl rounded-3xl border-2 border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 shadow-xl sm:p-8 lg:p-10">
          {/* Enhanced decorative backdrop with gradient inside card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-chart-5/30 via-chart-3/20 to-chart-2/30 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-tr from-chart-2/20 via-chart-4/10 to-chart-5/20 blur-3xl" />
          </div>

          <div className="relative z-10 w-full text-center">
            {/* Stats Display */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    {Icon && <Icon className="h-3.5 w-3.5 text-chart-3" />}
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Headline - Single Row with Typewriter Effect */}
            <h1
              id="hero-heading"
              className="font-display text-lg font-black leading-tight sm:text-xl md:text-2xl lg:text-3xl mt-3">
              {/* Row 1: Discover Powerful [typing word] */}
              <span className="block mb-1">
                <span className="inline">Discover </span>
                <span className="gradient-text inline">Powerful </span>
                <span
                  className="relative inline-flex justify-start align-baseline !w-[100px] sm:!w-[130px] md:!w-[150px]"
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                  onFocus={() => setPaused(true)}
                  onBlur={() => setPaused(false)}
                  onTouchStart={() => setPaused(true)}
                  onTouchEnd={() => setPaused(false)}
                >
                  <span className="gradient-text font-black" aria-live="polite" suppressHydrationWarning>
                    {displayText}
                    <span className="animate-pulse">|</span>
                  </span>
                </span>
              </span>
              {/* Row 2: That Actually Matter */}
              <span className="block">That Actually Matter</span>
            </h1>

            {/* Search Form */}
            <div className="mt-5 sm:mt-6">
              <div className="mx-auto w-full max-w-2xl">
                <div className="mb-2 flex justify-center">
                  {mounted ? <TrendingTicker /> : null}
                </div>
                {mounted ? (
                  <form onSubmit={handleFormSubmit} className="w-full">
                    <div className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card p-2 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                        <FolderSearch2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <AutocompleteSearch
                          value={query}
                          onChange={setQuery}
                          onSubmit={handleSubmit}
                          inputClassName="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="default"
                        className="shrink-0 shadow-sm"
                        disabled={isSearching}
                      >
                        {isSearching ? "Searching..." : "Search"}
                      </Button>
                    </div>
                  </form>
                ) : null}
              </div>

              {/* Quiz Button */}
              <div className="mt-2 flex justify-center">
                {mounted ? <ToolFinderQuiz /> : null}
              </div>

              {/* Category quick picks */}
              {mounted && categories && categories.length > 0 && (
                <div className="mx-auto mt-2 flex w-full max-w-2xl flex-wrap items-center justify-center gap-1.5">
                  {categories.map((c) => (
                    <Button
                      key={c}
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setQuery(c);
                        handleSubmit(c);
                      }}
                      className="h-7 rounded-full bg-secondary/80 px-3 text-xs font-medium text-foreground hover:bg-secondary transition-all hover:scale-105"
                      aria-label={`Search category ${c}`}>
                      {c}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};