import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import CustomAutumnProvider from "@/lib/autumn-provider";
import { generateMetadata as getMetadata } from "@/lib/metadata";
import { CookieConsent } from "@/components/cookie-consent";

import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Powerful Website You Should Know",
  description: "Discover the most powerful tools and websites to boost your productivity, creativity, and success.",
  url: "https://powerfulwebsiteyoushouldknow.com",
  logo: "https://powerfulwebsiteyoushouldknow.com/logo.png",
  sameAs: [
    "https://twitter.com/PowerfulWebsiteYouShouldKnow",
    "https://github.com/PowerfulWebsiteYouShouldKnow",
  ],
  potentialAction: {
    "@type": "SearchAction",
    target: "https://powerfulwebsiteyoushouldknow.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = getMetadata({
  title: "Discover the Best Tools & Platforms",
  description: "Explore curated directory of powerful websites, tools, and platforms. Find the perfect solution for design, development, marketing, productivity, and more.",
  path: "/",
  jsonLd,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-background text-foreground">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <Providers>
          <CustomAutumnProvider>
            {children}
            <CookieConsent />
          </CustomAutumnProvider>
        </Providers>
      
        <div style={{ position: 'fixed', pointerEvents: 'none', zIndex: 999999 }}>
          <VisualEditsMessenger />
        </div>
      </body>
    </html>
  );
}