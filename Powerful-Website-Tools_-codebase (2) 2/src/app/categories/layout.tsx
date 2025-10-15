import type { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Browse by Category",
  description: "Explore tools and websites organized by category. Find AI tools, design resources, developer tools, productivity apps, and more.",
  path: "/categories",
});

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}