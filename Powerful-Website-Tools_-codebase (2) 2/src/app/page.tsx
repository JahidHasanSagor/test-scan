import { HomePageClient } from "@/components/home-page-client";
import { generateMetadata as getMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import React from "react";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Powerful Website You Should Know",
  description: "Discover the most powerful tools and websites to boost your productivity, creativity, and success.",
  url: "https://powerfulwebsiteyoushouldknow.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://powerfulwebsiteyoushouldknow.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = getMetadata({
  title: "Discover Powerful Tools & Websites That Actually Matter",
  description: "Explore curated directory of powerful websites, tools, and platforms. Find the perfect solution for design, development, marketing, productivity, and more.",
  path: "/",
  jsonLd,
});

export default function Page() {
  return (
    <React.Suspense fallback={null}>
      <HomePageClient />
    </React.Suspense>
  );
}