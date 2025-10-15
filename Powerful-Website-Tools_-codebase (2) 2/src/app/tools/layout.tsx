import type { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Browse All Tools",
  description: "Discover powerful tools to enhance your productivity, creativity, and workflow. Filter by category, pricing, and type to find exactly what you need.",
  path: "/tools",
});

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}