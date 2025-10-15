import type { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Dashboard",
  description: "Manage your account, submissions, and saved tools. View your activity and contributions.",
  path: "/dashboard",
  noIndex: true, // Private page, don't index
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}