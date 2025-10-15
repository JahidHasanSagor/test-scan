import type { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Browse Websites",
  description: "Explore our curated collection of powerful websites and web platforms. Find the best online resources for your needs.",
  path: "/websites",
});

export default function WebsitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}