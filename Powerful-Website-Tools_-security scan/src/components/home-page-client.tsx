"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import SiteFooter from "./site-footer";

const SiteHeader = dynamic(() => import("./site-header"), { ssr: false });
const HeroSection = dynamic(() => import("./hero-section").then(m => m.HeroSection), { ssr: false });
const ToolDirectory = dynamic(() => import("./tool-directory"), { ssr: false });

export const HomePageClient: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showAuth />
      <main className="flex-1">
        <HeroSection />
        <div id="tool-directory">
          <ToolDirectory />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}