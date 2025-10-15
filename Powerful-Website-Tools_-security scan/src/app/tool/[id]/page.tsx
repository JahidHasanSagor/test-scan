import { ToolDetailClient } from "@/components/tool-detail-client";
import { generateMetadata as getMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Tool = {
  id: number;
  title: string;
  description: string;
  url: string;
  image: string | null;
  category: string;
  pricing: string;
  type: string;
  features: string[] | null;
  popularity: number;
  isFeatured: boolean;
  status: string;
  submittedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

type StructuredReview = {
  id: number;
  toolId: number;
  userId: string;
  category: string;
  metricScores: Record<string, number>;
  metricComments: Record<string, string>;
  overallRating: number;
  reviewText: string | null;
  reviewerType: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type SimilarTool = {
  id: number;
  title: string;
  description: string;
  url: string;
  image: string | null;
  category: string;
  pricing: string;
  popularity: number;
};

// Server-side data fetching
async function getToolData(toolId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const toolRes = await fetch(`${baseUrl}/api/tools/${toolId}`, {
      cache: "no-store",
    });
    
    if (!toolRes.ok) {
      return null;
    }
    
    const toolData = await toolRes.json();
    return {
      tool: toolData.tool || toolData,
      similarTools: toolData.similarTools || [],
    };
  } catch (error) {
    console.error("Error fetching tool:", error);
    return null;
  }
}

async function getStructuredReviews(toolId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/structured-reviews?toolId=${toolId}&status=approved`, {
      cache: "no-store",
    });
    
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

async function trackToolView(toolId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    await fetch(`${baseUrl}/api/tools/${toolId}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toolId }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error tracking view:", error);
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getToolData(params.id);
  
  if (!data || !data.tool) {
    return getMetadata({
      title: "Tool Not Found",
      description: "The requested tool could not be found.",
      path: `/tool/${params.id}`,
    });
  }

  const tool = data.tool;
  const reviews = await getStructuredReviews(params.id);
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: StructuredReview) => sum + r.overallRating, 0) / reviews.length
    : 0;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    applicationCategory: tool.category,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: tool.pricing === "free" ? "0" : undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: reviews.length > 0 ? {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      ratingCount: reviews.length,
      bestRating: "10",
      worstRating: "1",
    } : undefined,
    review: reviews.slice(0, 5).map((review: StructuredReview) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.overallRating,
        bestRating: "10",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: review.reviewerType,
      },
      reviewBody: review.reviewText || "Great tool!",
      datePublished: review.createdAt,
    })),
    url: tool.url,
    image: tool.image || undefined,
    datePublished: tool.createdAt,
    dateModified: tool.updatedAt,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://powerfulwebsiteyoushouldknow.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://powerfulwebsiteyoushouldknow.com/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.category,
        item: `https://powerfulwebsiteyoushouldknow.com/tools?category=${encodeURIComponent(tool.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: tool.title,
        item: `https://powerfulwebsiteyoushouldknow.com/tool/${params.id}`,
      },
    ],
  };

  return getMetadata({
    title: `${tool.title} - ${tool.category} Tool`,
    description: tool.description,
    path: `/tool/${params.id}`,
    keywords: [tool.title, tool.category, tool.pricing, tool.type, "tool", "software", "platform"],
    openGraph: {
      title: `${tool.title} - ${tool.category} Tool`,
      description: tool.description,
      images: tool.image ? [{ url: tool.image, width: 1200, height: 630, alt: tool.title }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.title} - ${tool.category} Tool`,
      description: tool.description,
      images: tool.image ? [tool.image] : undefined,
    },
    jsonLd: [productSchema, breadcrumbSchema],
  });
}

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const toolId = params.id;
  
  // Fetch data server-side
  const data = await getToolData(toolId);
  
  if (!data || !data.tool) {
    notFound();
  }

  const { tool, similarTools } = data;
  const structuredReviews = await getStructuredReviews(toolId);
  
  // Track view server-side
  await trackToolView(toolId);

  return (
    <ToolDetailClient
      initialTool={tool}
      initialSimilarTools={similarTools}
      initialReviews={structuredReviews}
      toolId={toolId}
    />
  );
}