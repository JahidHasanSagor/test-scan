import type { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Sign Up",
  description: "Create an account to submit tools, save your favorites, and join our community of tool enthusiasts.",
  path: "/register",
  noIndex: true, // Auth page, don't index
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}