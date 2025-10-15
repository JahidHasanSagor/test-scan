import { MetadataRoute } from 'next'
import { db } from '@/db/index'
import { tools, blogPosts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://powerful-website-tools.com'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/websites`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Fetch all approved tools
  const approvedTools = await db
    .select({
      id: tools.id,
      updatedAt: tools.updatedAt,
    })
    .from(tools)
    .where(eq(tools.status, 'approved'))
    .catch(() => [])

  const toolRoutes: MetadataRoute.Sitemap = approvedTools.map((tool) => ({
    url: `${baseUrl}/tool/${tool.id}`,
    lastModified: new Date(tool.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch all published blog posts
  const publishedPosts = await db
    .select({
      slug: blogPosts.slug,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.status, 'published'))
    .catch(() => [])

  const blogRoutes: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...toolRoutes, ...blogRoutes]
}