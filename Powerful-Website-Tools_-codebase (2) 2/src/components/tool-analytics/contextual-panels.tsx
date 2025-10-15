"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Briefcase, 
  Lightbulb, 
  Eye, 
  Star,
  ArrowRight,
  Flame,
  Users,
  Loader2
} from "lucide-react";
import { truncateWords } from "@/lib/text-utils";
import { toast } from "sonner";

interface ContextualPanelsProps {
  currentToolId: number;
  category: string;
  userIndustry?: string;
}

type RecommendedTool = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  category: string;
  pricing: string;
  popularity: number;
  isFeatured: boolean;
  reason?: string;
};

export function ContextualPanels({ 
  currentToolId, 
  category, 
  userIndustry 
}: ContextualPanelsProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [complementaryTools, setComplementaryTools] = React.useState<RecommendedTool[]>([]);
  const [industryTools, setIndustryTools] = React.useState<RecommendedTool[]>([]);
  const [trendingTools, setTrendingTools] = React.useState<RecommendedTool[]>([]);

  React.useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const token = localStorage.getItem("bearer_token");

        // Fetch similar tools for "You Might Also Need"
        const similarRes = await fetch(`/api/similar/${currentToolId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (similarRes.ok) {
          const data = await similarRes.json();
          setComplementaryTools(data.slice(0, 3));
        }

        // Fetch category tools for "Others in Your Industry Use"
        const categoryRes = await fetch(`/api/tools?category=${encodeURIComponent(category)}&limit=3`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (categoryRes.ok) {
          const data = await categoryRes.json();
          const filtered = data.tools?.filter((t: RecommendedTool) => t.id !== currentToolId).slice(0, 3) || [];
          setIndustryTools(filtered);
        }

        // Fetch trending tools
        const trendingRes = await fetch("/api/tools/trending?limit=3", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (trendingRes.ok) {
          const data = await trendingRes.json();
          const filtered = data.tools?.filter((t: RecommendedTool) => t.id !== currentToolId).slice(0, 3) || [];
          setTrendingTools(filtered);
        }

      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [currentToolId, category]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const ToolCard = ({ tool, showReason = false }: { tool: RecommendedTool; showReason?: boolean }) => (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 h-full"
      onClick={() => router.push(`/tool/${tool.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {tool.image && (
            <div className="relative h-14 w-14 shrink-0">
              <Image
                src={tool.image}
                alt={`${tool.title} logo`}
                fill
                className="rounded-lg border border-border object-cover"
                sizes="56px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                {tool.title}
              </h4>
              {tool.isFeatured && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  <Star className="h-2.5 w-2.5 mr-1 fill-current" />
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {truncateWords(tool.description, 80)}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Badge variant="outline" className="text-xs">
                {tool.category}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {tool.pricing}
              </Badge>
              <div className="flex items-center gap-0.5 text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{tool.popularity}</span>
              </div>
            </div>
            {showReason && tool.reason && (
              <p className="text-xs text-primary/80 mt-2 italic">
                {tool.reason}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* You Might Also Need */}
      {complementaryTools.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-chart-4" />
              You Might Also Need
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/tools?category=${encodeURIComponent(category)}`)}
              className="gap-1"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Complementary tools to enhance your workflow
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {complementaryTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Others in Your Industry Use */}
      {industryTools.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-chart-3" />
              Others in {category} Use
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/tools?category=${encodeURIComponent(category)}`)}
              className="gap-1"
            >
              Explore Category
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Popular tools in the <span className="font-semibold">{category}</span> category
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industryTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Trending in This Category */}
      {trendingTools.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <Flame className="h-5 w-5 text-chart-1" />
              Trending Right Now
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/tools?sort=trending")}
              className="gap-1"
            >
              See All Trending
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Tools gaining traction this week
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trendingTools.map((tool, index) => (
              <div key={tool.id} className="relative">
                {/* Trending Badge */}
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                    <Flame className="h-3 w-3 mr-1" />
                    #{index + 1}
                  </Badge>
                </div>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {complementaryTools.length === 0 && industryTools.length === 0 && trendingTools.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recommendations available at this time.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/tools")}
            >
              Browse All Tools
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}