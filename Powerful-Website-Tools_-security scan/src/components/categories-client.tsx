"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Code, 
  Megaphone, 
  Zap, 
  Brain, 
  BarChart 
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const categoryDefinitions: Category[] = [
  {
    id: "design",
    name: "Design",
    description: "UI/UX tools, design systems, and creative resources",
    icon: <Palette className="h-6 w-6" />,
    color: "from-chart-5 to-purple-500",
  },
  {
    id: "development",
    name: "Development",
    description: "Code editors, APIs, frameworks, and developer tools",
    icon: <Code className="h-6 w-6" />,
    color: "from-chart-3 to-blue-500",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "SEO, analytics, content, and growth marketing tools",
    icon: <Megaphone className="h-6 w-6" />,
    color: "from-chart-4 to-yellow-500",
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Task management, note-taking, and workflow optimization",
    icon: <Zap className="h-6 w-6" />,
    color: "from-chart-2 to-green-500",
  },
  {
    id: "ai",
    name: "AI",
    description: "Machine learning, natural language, and AI-powered tools",
    icon: <Brain className="h-6 w-6" />,
    color: "from-chart-1 to-gray-600",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Data visualization, metrics, and business intelligence",
    icon: <BarChart className="h-6 w-6" />,
    color: "from-chart-5 to-indigo-500",
  },
];

interface CategoriesClientProps {
  categoryCounts: Record<string, number>;
}

export function CategoriesClient({ categoryCounts }: CategoriesClientProps) {
  const router = useRouter();

  const handleHeaderSearch = React.useCallback(
    (q: string) => {
      if (!q.trim()) return;
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    },
    [router]
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader showSearch showAuth onSearchSubmit={handleHeaderSearch} />

      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
        <div className="mx-auto max-w-6xl">
          {/* Page header */}
          <div className="mb-8">
            <div className="mb-3 h-1.5 w-32 rounded-full bg-gradient-to-r from-chart-3 via-chart-5 to-chart-2" />
            <h1 className="text-3xl font-bold sm:text-4xl mb-2">Browse by Category</h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Explore tools and websites organized by category. 
              Find exactly what you need to boost your workflow.
            </p>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categoryDefinitions.map((category) => {
              const count = categoryCounts[category.id] || 0;
              
              return (
                <Link 
                  key={category.id} 
                  href={`/tools?category=${category.id}`}
                  className="group"
                >
                  <Card className="h-full border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${category.color} text-white mb-3`}>
                        {category.icon}
                      </div>
                      <CardTitle className="text-xl flex items-center justify-between gap-2">
                        <span className="group-hover:underline">{category.name}</span>
                        <Badge variant="secondary" className="font-normal">
                          {count}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}