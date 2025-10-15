/**
 * Unified Search Service
 * Centralizes all search logic across the application
 */

export interface SearchParams {
  query: string;
  categories?: string[];
  pricing?: string[];
  features?: string[];
  type?: string; // added single type filter to align with API
  sort?: 'relevance' | 'newest' | 'popular' | 'trending' | 'rating';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: string;
  featured?: boolean;
  [key: string]: any;
}

export interface SearchResponse {
  tools: SearchResult[];
  total: number;
  hasMore: boolean;
}

/**
 * Main search function that queries the tools API
 */
export async function searchTools(params: SearchParams): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  
  // Add search query
  if (params.query?.trim()) {
    searchParams.append('search', params.query.trim());
  }
  
  // Add filters
  if (params.categories && params.categories.length > 0) {
    params.categories.forEach(cat => searchParams.append('category', cat));
  }
  
  if (params.pricing && params.pricing.length > 0) {
    params.pricing.forEach(price => searchParams.append('pricing', price));
  }
  
  if (params.features && params.features.length > 0) {
    params.features.forEach(feature => searchParams.append('feature', feature));
  }
  
  // NEW: single type filter
  if (params.type && params.type !== 'all') {
    searchParams.append('type', params.type);
  }
  
  // Add sorting
  if (params.sort) {
    searchParams.append('sort', params.sort);
  }
  
  // Add pagination
  if (params.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  
  if (params.offset) {
    searchParams.append('offset', params.offset.toString());
  }
  
  const response = await fetch(`/api/tools?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Search request failed');
  }
  
  const data = await response.json();
  
  return {
    tools: data.tools || [],
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

/**
 * AI-powered search that handles typos and understands user intent
 * Uses OpenAI to enhance search queries and rank results by relevance
 */
export async function searchToolsAI(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch('/api/search/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      // Fallback to regular search if AI search fails
      console.warn('AI search failed, falling back to regular search');
      return searchTools({ search: query });
    }

    const data = await response.json();
    
    // Transform database results to SearchResult format
    return data.results.map((tool: any) => ({
      id: tool.id.toString(),
      name: tool.name,
      description: tool.description || '',
      tagline: tool.tagline || '',
      category: tool.category || 'AI & Machine Learning',
      pricing: tool.pricing,
      url: tool.url,
      logo: tool.logo,
      popularity: tool.popularity || 0,
      featured: tool.featured || false,
      type: tool.type,
      status: tool.status,
    }));
  } catch (error) {
    console.error('AI search error:', error);
    // Fallback to regular search on error
    return searchTools({ search: query });
  }
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`/api/tools?search=${encodeURIComponent(query)}&limit=5`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return (data.tools || []).map((tool: SearchResult) => tool.title);
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return [];
  }
}

/**
 * Build search URL with parameters
 */
export function buildSearchUrl(params: SearchParams): string {
  const searchParams = new URLSearchParams();
  
  if (params.query?.trim()) {
    searchParams.append('q', params.query.trim());
  }
  
  if (params.categories && params.categories.length > 0) {
    params.categories.forEach(cat => searchParams.append('category', cat));
  }
  
  if (params.pricing && params.pricing.length > 0) {
    params.pricing.forEach(price => searchParams.append('pricing', price));
  }
  
  if (params.features && params.features.length > 0) {
    params.features.forEach(feature => searchParams.append('feature', feature));
  }
  
  // NEW: include type in URL when set and not "all"
  if (params.type && params.type !== 'all') {
    searchParams.append('type', params.type);
  }
  
  if (params.sort && params.sort !== 'relevance') {
    searchParams.append('sort', params.sort);
  }
  
  const queryString = searchParams.toString();
  return queryString ? `/search?${queryString}` : '/search';
}

/**
 * Parse search parameters from URL
 */
export function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  return {
    query: searchParams.get('q') || searchParams.get('search') || '',
    categories: searchParams.getAll('category'),
    pricing: searchParams.getAll('pricing'),
    features: searchParams.getAll('feature'),
    type: searchParams.get('type') || 'all',
    sort: (searchParams.get('sort') as SearchParams['sort']) || 'relevance',
  };
}

/**
 * Validate search query
 */
export function isValidSearchQuery(query: string): boolean {
  const trimmed = query.trim();
  return trimmed.length > 0 && trimmed.length <= 200;
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query.trim().slice(0, 200);
}