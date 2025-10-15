import type { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Search Results",
  description: "Search our directory of powerful tools and websites. Find exactly what you're looking for with advanced filters.",
  path: "/search",
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}