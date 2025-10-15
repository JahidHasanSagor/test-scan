import { BlogPostClient } from "@/components/blog-post-client";
import { generateMetadata as getMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: string;
  featured: boolean;
  viewCount: number;
  readTime: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

type RelatedPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  readTime: string;
  publishedAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author?: {
    name: string;
    email: string;
    image: string | null;
  };
  authorName?: string;
  authorEmail?: string;
};

// Server-side data fetching
async function getBlogPost(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/blog/${slug}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return {
      post: data.post,
      relatedPosts: data.relatedPosts || [],
    };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

async function getComments(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/blog/${slug}/comments`, {
      cache: "no-store",
    });
    
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

async function trackBlogView(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    await fetch(`${baseUrl}/api/blog/${slug}/view`, {
      method: "POST",
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error tracking view:", error);
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getBlogPost(params.slug);
  
  if (!data || !data.post) {
    return getMetadata({
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
      path: `/blog/${params.slug}`,
    });
  }

  const post = data.post;
  const comments = await getComments(params.slug);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author ? {
      "@type": "Person",
      name: post.author.name,
      email: post.author.email,
      image: post.author.image || undefined,
    } : undefined,
    publisher: {
      "@type": "Organization",
      name: "Powerful Website You Should Know",
      logo: {
        "@type": "ImageObject",
        url: "https://powerfulwebsiteyoushouldknow.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://powerfulwebsiteyoushouldknow.com/blog/${params.slug}`,
    },
    articleSection: post.category?.name || undefined,
    keywords: post.tags.map((tag) => tag.name).join(", "),
    wordCount: post.content.split(/\s+/).length,
    commentCount: comments.length,
    inLanguage: "en-US",
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
        name: "Blog",
        item: "https://powerfulwebsiteyoushouldknow.com/blog",
      },
      ...(post.category ? [{
        "@type": "ListItem",
        position: 3,
        name: post.category.name,
        item: `https://powerfulwebsiteyoushouldknow.com/blog?category=${post.category.id}`,
      }] : []),
      {
        "@type": "ListItem",
        position: post.category ? 4 : 3,
        name: post.title,
        item: `https://powerfulwebsiteyoushouldknow.com/blog/${params.slug}`,
      },
    ],
  };

  return getMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${params.slug}`,
    keywords: [
      post.title,
      post.category?.name || "",
      ...post.tags.map((tag) => tag.name),
      "blog",
      "article",
      "tutorial"
    ],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [{ url: post.featuredImage, width: 1200, height: 630, alt: post.title }] : undefined,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      tags: post.tags.map((tag) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    jsonLd: [articleSchema, breadcrumbSchema],
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  
  // Fetch data server-side
  const data = await getBlogPost(slug);
  
  if (!data || !data.post) {
    notFound();
  }

  const { post, relatedPosts } = data;
  const comments = await getComments(slug);
  
  // Track view server-side
  await trackBlogView(slug);

  return (
    <BlogPostClient
      post={post}
      relatedPosts={relatedPosts}
      initialComments={comments}
      slug={slug}
    />
  );
}