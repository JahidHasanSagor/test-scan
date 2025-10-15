import { CategoriesClient } from "@/components/categories-client";
import { generateMetadata as getMetadata, siteConfig } from "@/lib/metadata";
import type { Metadata } from "next";

// Server-side data fetching for category counts
async function getCategoryCounts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/tools`, {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const tools = data.tools || data;
      
      // Count tools per category
      const counts: Record<string, number> = {};
      tools.forEach((tool: any) => {
        const cat = tool.category?.toLowerCase() || "";
        counts[cat] = (counts[cat] || 0) + 1;
      });
      
      return counts;
    }
    return {};
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return {};
  }
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const categoryCounts = await getCategoryCounts();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${siteConfig.url}/categories`,
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Browse Tools by Category",
    description: "Explore our curated collection of tools and websites organized by category.",
    url: `${siteConfig.url}/categories`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: Object.values(categoryCounts).reduce((sum, count) => sum + count, 0),
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Design Tools",
          url: `${siteConfig.url}/tools?category=design`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Development Tools",
          url: `${siteConfig.url}/tools?category=development`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Marketing Tools",
          url: `${siteConfig.url}/tools?category=marketing`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Productivity Tools",
          url: `${siteConfig.url}/tools?category=productivity`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "AI Tools",
          url: `${siteConfig.url}/tools?category=ai`,
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "Analytics Tools",
          url: `${siteConfig.url}/tools?category=analytics`,
        },
      ],
    },
  };

  return getMetadata({
    title: "Browse Tools by Category - Find the Perfect Solution",
    description: "Explore our curated collection of tools and websites organized by category. Find design, development, marketing, productivity, AI, and analytics tools.",
    path: "/categories",
    keywords: ["categories", "tools", "design", "development", "marketing", "productivity", "AI", "analytics", "browse tools"],
    jsonLd: [breadcrumbSchema, collectionSchema],
  });
}

export default async function CategoriesPage() {
  // Fetch category counts server-side
  const categoryCounts = await getCategoryCounts();

  return (
    <CategoriesClient categoryCounts={categoryCounts} />
  );
}