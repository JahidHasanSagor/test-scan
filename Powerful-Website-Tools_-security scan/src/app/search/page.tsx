"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchResults } from "@/components/search-results";
import { SearchFilters } from "@/components/search-filters";
import { searchTools, parseSearchParams, buildSearchUrl } from "@/lib/search-service";
import type { SearchResult } from "@/lib/search-service";
import { Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import dynamic from "next/dynamic";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = parseSearchParams(searchParams as URLSearchParams);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.query);
  const [category, setCategory] = useState(params.categories[0] || "all");
  const [pricing, setPricing] = useState(params.pricing[0] || "all");
  const [type, setType] = useState(params.type || "all");
  const [sort, setSort] = useState(params.sort || "popular");
  const [useAI, setUseAI] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  useEffect(() => {
    fetchResults();
  }, [searchParams]);

  const fetchResults = async () => {
    setLoading(true);
    setAiAnalysis(null);
    
    try {
      // Use AI search if enabled and there's a search query
      if (useAI && query) {
        const response = await fetch('/api/search/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiAnalysis(data.aiAnalysis);
          
          // Transform results to match SearchResult format
          const transformedResults = data.results.map((tool: any) => ({
            id: tool.id.toString(),
            title: tool.title,
            description: tool.description || '',
            icon: tool.image || tool.logo,
            category: tool.category,
            pricing: tool.pricing,
            url: tool.url,
            featured: tool.isFeatured || false,
            popularity: tool.popularity || 0,
            type: tool.type,
            status: tool.status,
            rating: 4.5,
            reviews: [],
            features: Array.isArray(tool.features) ? tool.features : [],
            website: tool.url,
            image: tool.image || "",
            createdAt: tool.createdAt,
            isPremium: tool.isPremium || false,
            videoUrl: tool.videoUrl || null,
            extendedDescription: tool.extendedDescription || null,
            votes: tool.votes || 0,
            views: tool.views || 0,
          }));
          
          setResults(transformedResults);
          setLoading(false);
          return;
        }
      }

      // Fallback to regular search
      const data = await searchTools({
        query: query,
        categories: category !== "all" ? [category] : undefined,
        pricing: pricing !== "all" ? [pricing] : undefined,
        type: type !== "all" ? type : undefined,
        sort: sort as any,
      });
      
      // Transform regular search results
      const transformedResults = data.tools.map((tool: any) => ({
        ...tool,
        rating: 4.5,
        reviews: [],
        features: Array.isArray(tool.features) ? tool.features : [],
        website: tool.url,
        image: tool.icon || "",
        votes: tool.votes || 0,
        views: tool.views || 0,
      }));
      
      setResults(transformedResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = (newQuery: string, newCategory: string, newPricing: string, newSort: string, newType: string) => {
    const url = buildSearchUrl({
      query: newQuery,
      categories: newCategory !== "all" ? [newCategory] : undefined,
      pricing: newPricing !== "all" ? [newPricing] : undefined,
      sort: newSort as any,
      type: newType !== "all" ? newType : undefined,
    });
    router.push(url);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "category") {
      setCategory(value);
      updateUrlParams(query, value, pricing, sort, type);
    } else if (filterType === "pricing") {
      setPricing(value);
      updateUrlParams(query, category, value, sort, type);
    } else if (filterType === "sort") {
      setSort(value);
      updateUrlParams(query, category, pricing, value, type);
    } else if (filterType === "type") {
      setType(value);
      updateUrlParams(query, category, pricing, sort, value);
    }
  };

  const toggleAISearch = () => {
    setUseAI(!useAI);
    setTimeout(fetchResults, 100);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showAuth />
      
      <main className="flex-1">
        <div className="min-h-screen bg-background">
          {/* Header Section */}
          <div className="border-b bg-card">
            <div className="container py-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {query ? `Search results for "${query}"` : "Browse Tools"}
                  </h1>
                  <p className="text-muted-foreground">
                    {loading ? "Searching..." : `Found ${results.length} tools`}
                  </p>
                </div>
                
                {/* AI Toggle */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={useAI ? "default" : "outline"}
                        size="sm"
                        onClick={toggleAISearch}
                        className={useAI ? "gradient-ai text-white" : ""}
                      >
                        {useAI ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Search
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Basic Search
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{useAI ? "Using AI-powered semantic search with typo correction" : "Using basic text search"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* AI Analysis Display */}
              {useAI && aiAnalysis && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        AI Understanding
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        {aiAnalysis.intent}
                      </p>
                      {aiAnalysis.correctedQuery !== query && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                          Showing results for: <span className="font-medium">{aiAnalysis.correctedQuery}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <SearchFilters
                  category={category}
                  pricing={pricing}
                  type={type}
                  sort={sort}
                  onFilterChange={handleFilterChange}
                />
              </aside>

              {/* Results */}
              <main className="lg:col-span-3">
                <SearchResults results={results} loading={loading} />
              </main>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}