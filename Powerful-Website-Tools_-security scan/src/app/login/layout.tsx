import type { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Log In",
  description: "Log in to your account to submit tools, save favorites, and manage your profile.",
  path: "/login",
  noIndex: true, // Auth page, don't index
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}