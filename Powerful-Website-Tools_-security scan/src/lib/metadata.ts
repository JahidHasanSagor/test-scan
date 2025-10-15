import type { Metadata } from "next";

export const siteConfig = {
  name: "Powerful Website You Should Know",
  description: "Discover the most powerful tools and websites to boost your productivity, creativity, and success. Browse our curated directory of the best web apps, AI tools, and SaaS platforms.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://powerfulwebsiteyoushouldknow.com",
  ogImage: "/og-image.png",
  twitterHandle: "@PowerfulWebsiteYouShouldKnow",
};

export function generateMetadata({
  title,
  description,
  image,
  noIndex = false,
  path = "",
  keywords,
  openGraph,
  twitter,
  jsonLd,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  path?: string;
  keywords?: string[];
  openGraph?: Metadata['openGraph'];
  twitter?: Metadata['twitter'];
  jsonLd?: any | any[];
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const url = `${siteConfig.url}${path}`;

  const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    applicationName: siteConfig.name,
    keywords: keywords || [
      "tools directory",
      "web apps",
      "productivity tools",
      "AI tools",
      "SaaS platforms",
      "website directory",
      "tech tools",
      "developer tools",
      "design tools",
      "marketing tools",
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: openGraph || {
      type: "website",
      locale: "en_US",
      url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: twitter || {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: siteConfig.twitterHandle,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  if (jsonLd) {
    const scripts = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    metadata.other = {
      ...metadata.other,
      'script:ld+json': scripts.map(data => JSON.stringify(data)),
    };
  }

  return metadata;
}