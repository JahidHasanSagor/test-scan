"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search, Sparkles, TrendingUp, Clock, Zap, Palette, Code, Megaphone, BarChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Suggestion = {
  id: string;
  text: string;
  type: "category" | "tool" | "trending" | "recent";
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  category?: string;
  featured?: boolean;
  isPro?: boolean;
};

// Enhanced default suggestions with icons
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: "t1", text: "AI Tools", type: "trending", icon: Zap },
  { id: "t2", text: "Design Software", type: "trending", icon: Palette },
  { id: "t3", text: "Developer Tools", type: "trending", icon: Code },
  { id: "t4", text: "Marketing Automation", type: "trending", icon: Megaphone },
  { id: "c1", text: "Productivity", type: "category", icon: Sparkles },
  { id: "c2", text: "Analytics", type: "category", icon: BarChart },
];

// Enhanced rotating placeholder suggestions with trending categories and use cases
const ROTATING_PLACEHOLDERS = [
  // AI & Machine Learning
  "AI image generator",
  "AI writing assistant",
  "AI video editor",
  "ChatGPT alternatives",
  "AI voice generator",
  "AI art tools",
  "Machine learning platforms",
  
  // Design & Creative
  "Design tools",
  "Video editor",
  "Photo editing software",
  "UI/UX design tools",
  "3D modeling software",
  "Animation tools",
  "Graphic design apps",
  "Color palette generators",
  
  // Productivity
  "Productivity app",
  "Project management",
  "Task management tools",
  "Note-taking apps",
  "Time tracking software",
  "Calendar apps",
  "Focus & concentration tools",
  
  // Development
  "Code editor",
  "API testing tools",
  "Database management",
  "Version control systems",
  "CI/CD platforms",
  "No-code builders",
  "Developer productivity tools",
  
  // Marketing & Sales
  "Marketing automation",
  "Email marketing tools",
  "Social media schedulers",
  "SEO tools",
  "CRM software",
  "Landing page builders",
  "Analytics platforms",
  
  // Business & Finance
  "Accounting software",
  "Invoice generators",
  "Business analytics",
  "Customer feedback tools",
  "Team collaboration apps",
  "HR management systems",
  
  // Content & Media
  "Content creation tools",
  "Podcast editing software",
  "Screen recording apps",
  "Live streaming platforms",
  "Subtitle generators",
  "Music production tools",
  
  // E-commerce & Retail
  "E-commerce platforms",
  "Payment gateways",
  "Inventory management",
  "Shipping & fulfillment tools",
  
  // Communication
  "Video conferencing tools",
  "Team chat apps",
  "Email clients",
  "Customer support software",
];

export interface AutocompleteSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function AutocompleteSearch({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  inputClassName,
}: AutocompleteSearchProps) {
  const [focused, setFocused] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>(DEFAULT_SUGGESTIONS);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const [currentPlaceholder, setCurrentPlaceholder] = React.useState("");
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  // ensure client-only behaviors start after mount to avoid hydration mismatches
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Faster typewriter effect for placeholder with random selection
  React.useEffect(() => {
    if (!mounted) return; // do not run on first SSR/hydration paint
    const currentWord = ROTATING_PLACEHOLDERS[placeholderIndex];
    const typingSpeed = 50; // Faster typing (was 100ms)
    const deletingSpeed = 25; // Faster deleting (was 50ms)
    const pauseAfterTyping = 1500; // Shorter pause (was 2000ms)
    const pauseAfterDeleting = 300; // Shorter pause (was 500ms)

    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentPlaceholder.length < currentWord.length) {
      // Typing
      timeout = setTimeout(() => {
        setCurrentPlaceholder(currentWord.slice(0, currentPlaceholder.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && currentPlaceholder.length === currentWord.length) {
      // Pause before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseAfterTyping);
    } else if (isDeleting && currentPlaceholder.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setCurrentPlaceholder(currentWord.slice(0, currentPlaceholder.length - 1));
      }, deletingSpeed);
    } else if (isDeleting && currentPlaceholder.length === 0) {
      // Move to random next word
      timeout = setTimeout(() => {
        setIsDeleting(false);
        // Pick a random index that's different from current
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * ROTATING_PLACEHOLDERS.length);
        } while (randomIndex === placeholderIndex && ROTATING_PLACEHOLDERS.length > 1);
        setPlaceholderIndex(randomIndex);
      }, pauseAfterDeleting);
    }

    return () => clearTimeout(timeout);
  }, [currentPlaceholder, isDeleting, placeholderIndex, mounted]);

  // Calculate dropdown position
  const updatePosition = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  React.useEffect(() => {
    if (focused) {
      updatePosition();
    }
  }, [focused, updatePosition]);

  // Update position on scroll/resize
  React.useEffect(() => {
    if (!focused) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [focused, updatePosition]);

  // Fetch real suggestions from API with debouncing
  React.useEffect(() => {
    // Show default suggestions when empty
    if (!value.trim()) {
      setSuggestions(DEFAULT_SUGGESTIONS);
      setIsLoadingSuggestions(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Debounce API calls
    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Failed to fetch suggestions");

        const data = await response.json();
        
        // Combine tools and categories into a single suggestions array
        const allSuggestions: Suggestion[] = [
          ...data.tools.map((tool: any) => ({
            id: tool.id,
            text: tool.text,
            type: "tool" as const,
            description: tool.description,
            category: tool.category,
            featured: tool.featured,
            isPro: tool.isPro,
          })),
          ...data.categories.map((cat: any) => ({
            id: cat.id,
            text: cat.text,
            type: "category" as const,
            icon: Sparkles,
          })),
        ];

        setSuggestions(allSuggestions.length > 0 ? allSuggestions : DEFAULT_SUGGESTIONS);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching suggestions:", error);
          setSuggestions(DEFAULT_SUGGESTIONS);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        setFocused(false);
        onSubmit(value);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    setFocused(false);
    onSubmit(suggestion.text);
  };

  const handleInputBlur = () => {
    // Delay closing to allow button clicks to register
    setTimeout(() => setFocused(false), 150);
  };

  const getSuggestionIcon = (type: Suggestion["type"]) => {
    switch (type) {
      case "category":
        return Sparkles;
      case "trending":
        return TrendingUp;
      case "recent":
        return Clock;
      default:
        return Search;
    }
  };

  const getSuggestionColor = (type: Suggestion["type"]) => {
    switch (type) {
      case "category":
        return "text-chart-5";
      case "trending":
        return "text-chart-3";
      case "recent":
        return "text-chart-4";
      default:
        return "text-muted-foreground";
    }
  };

  const showSuggestions = focused && suggestions.length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || currentPlaceholder}
          className={cn("w-full pr-10", inputClassName)}
          autoComplete="off"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 9999,
              }}
              className="rounded-xl border-2 border-border bg-card shadow-2xl overflow-hidden"
            >
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground px-3 py-2 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  {value.trim() ? (isLoadingSuggestions ? "Searching..." : "Suggestions") : "Popular Searches"}
                </div>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon || getSuggestionIcon(suggestion.type);
                    const colorClass = getSuggestionColor(suggestion.type);
                    
                    return (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                            "hover:bg-secondary/80",
                            selectedIndex === index && "bg-secondary"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", colorClass)} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                              {suggestion.text}
                              {suggestion.featured && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                  Featured
                                </span>
                              )}
                              {suggestion.isPro && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-chart-5/10 text-chart-5 font-medium">
                                  Pro
                                </span>
                              )}
                            </div>
                            {suggestion.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {suggestion.description}
                              </div>
                            )}
                            {!suggestion.description && (
                              <div className="text-xs text-muted-foreground capitalize">
                                {suggestion.type === "tool" ? (suggestion.category || "Tool") : suggestion.type}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">↑↓</kbd> Navigate{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">Enter</kbd> Select{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">Esc</kbd> Close
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}