"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Clock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchSuggestion = {
  type: "tool" | "category" | "recent" | "trending";
  value: string;
  label: string;
  metadata?: {
    category?: string;
    pricing?: string;
    popularity?: number;
  };
};

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search tools, features, categories...",
  className,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  // Load recent searches from localStorage
  const getRecentSearches = React.useCallback(() => {
    if (typeof window === "undefined") return [];
    const recent = localStorage.getItem("recent_searches");
    return recent ? JSON.parse(recent) : [];
  }, []);

  // Save search to recent
  const saveToRecent = React.useCallback((search: string) => {
    if (typeof window === "undefined" || !search.trim()) return;
    const recent = getRecentSearches();
    const updated = [search, ...recent.filter((s: string) => s !== search)].slice(0, 5);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }, [getRecentSearches]);

  // Fetch suggestions
  React.useEffect(() => {
    if (!value.trim()) {
      // Show recent searches and trending when empty
      const recent = getRecentSearches();
      const recentSuggestions: SearchSuggestion[] = recent.map((search: string) => ({
        type: "recent" as const,
        value: search,
        label: search,
      }));

      // Add some trending suggestions
      const trendingSuggestions: SearchSuggestion[] = [
        { type: "trending", value: "AI tools", label: "AI tools" },
        { type: "trending", value: "Design tools", label: "Design tools" },
        { type: "trending", value: "Productivity apps", label: "Productivity apps" },
      ];

      setSuggestions([...recentSuggestions, ...trendingSuggestions]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch(`/api/tools?search=${encodeURIComponent(value)}&limit=5`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          const toolSuggestions: SearchSuggestion[] = (data.tools || []).map((tool: any) => ({
            type: "tool" as const,
            value: tool.title,
            label: tool.title,
            metadata: {
              category: tool.category,
              pricing: tool.pricing,
              popularity: tool.popularity,
            },
          }));

          // Add category suggestions if query matches
          const categories = ["Design", "Development", "Marketing", "Productivity", "AI", "Analytics"];
          const categorySuggestions: SearchSuggestion[] = categories
            .filter((cat) => cat.toLowerCase().includes(value.toLowerCase()))
            .map((cat) => ({
              type: "category" as const,
              value: cat,
              label: cat,
            }));

          setSuggestions([...toolSuggestions, ...categorySuggestions]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [value, getRecentSearches]);

  const handleSelect = (suggestion: SearchSuggestion) => {
    const searchValue = suggestion.value;
    onChange(searchValue);
    saveToRecent(searchValue);
    setIsFocused(false);

    if (onSelect) {
      onSelect(searchValue);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "recent":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-chart-4" />;
      case "category":
        return <Hash className="h-4 w-4 text-chart-3" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Command className={cn("relative rounded-full border border-border bg-secondary", className)}>
      <CommandInput
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        className="h-10"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />

      {isFocused && suggestions.length > 0 && (
        <CommandList className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[300px] overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          <CommandEmpty>
            {isLoading ? "Loading..." : "No results found"}
          </CommandEmpty>

          {suggestions.filter((s) => s.type === "recent").length > 0 && (
            <CommandGroup heading="Recent Searches">
              {suggestions
                .filter((s) => s.type === "recent")
                .map((suggestion) => (
                  <CommandItem
                    key={`recent-${suggestion.value}`}
                    onSelect={() => handleSelect(suggestion)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <span className="flex-1">{suggestion.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {suggestions.filter((s) => s.type === "trending").length > 0 && (
            <CommandGroup heading="Trending">
              {suggestions
                .filter((s) => s.type === "trending")
                .map((suggestion) => (
                  <CommandItem
                    key={`trending-${suggestion.value}`}
                    onSelect={() => handleSelect(suggestion)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <span className="flex-1">{suggestion.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {suggestions.filter((s) => s.type === "tool").length > 0 && (
            <CommandGroup heading="Tools">
              {suggestions
                .filter((s) => s.type === "tool")
                .map((suggestion) => (
                  <CommandItem
                    key={`tool-${suggestion.value}`}
                    onSelect={() => handleSelect(suggestion)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{suggestion.label}</span>
                        {suggestion.metadata?.category && (
                          <Badge variant="outline" className="text-xs">
                            {suggestion.metadata.category}
                          </Badge>
                        )}
                      </div>
                      {suggestion.metadata?.pricing && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {suggestion.metadata.pricing}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {suggestions.filter((s) => s.type === "category").length > 0 && (
            <CommandGroup heading="Categories">
              {suggestions
                .filter((s) => s.type === "category")
                .map((suggestion) => (
                  <CommandItem
                    key={`category-${suggestion.value}`}
                    onSelect={() => handleSelect(suggestion)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <span className="flex-1">{suggestion.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
}