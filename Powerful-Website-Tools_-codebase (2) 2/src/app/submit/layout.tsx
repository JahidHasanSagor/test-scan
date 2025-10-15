import type { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Submit a Tool",
  description: "Share amazing tools with our community. Submit your tool for review and help others discover great resources.",
  path: "/submit",
});

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}