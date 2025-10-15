"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users, ArrowRight, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type RecommendedTool = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  category: string;
  pricing: string;
  popularity: number;
};

interface RecommendationPanelsProps {
  currentTool: {
    id: number;
    category: string;
  };
  similarTools?: RecommendedTool[];
  complementaryTools?: RecommendedTool[];
}

export function RecommendationPanels({
  currentTool,
  similarTools = [],
  complementaryTools = [],
}: RecommendationPanelsProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* You Might Also Need */}
      {complementaryTools.length > 0 && (
        <Card className="border-chart-2/30 bg-gradient-to-br from-chart-2/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-chart-2" />
              You Might Also Need
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Complementary tools for complete workflows
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {complementaryTools.slice(0, 3).map((tool) => (
              <div
                key={tool.id}
                className="flex gap-3 p-3 rounded-lg bg-card border border-border hover:border-chart-2/50 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => router.push(`/tool/${tool.id}`)}
              >
                {tool.image && (
                  <div className="relative h-12 w-12 shrink-0">
                    <Image
                      src={tool.image}
                      alt={tool.title}
                      fill
                      className="rounded-lg object-cover border border-border"
                      sizes="48px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-chart-2 transition-colors">
                    {tool.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-secondary/50">
                      {tool.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize bg-secondary/50">
                      {tool.pricing}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Similar Tools */}
      {similarTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-chart-3" />
              Similar Tools
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Alternative options in the {currentTool.category} category
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {similarTools.slice(0, 4).map((tool) => (
              <div
                key={tool.id}
                className="flex gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => router.push(`/tool/${tool.id}`)}
              >
                {tool.image && (
                  <div className="relative h-12 w-12 shrink-0">
                    <Image
                      src={tool.image}
                      alt={tool.title}
                      fill
                      className="rounded-lg object-cover border border-border"
                      sizes="48px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-secondary/50">
                      {tool.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize bg-secondary/50">
                      {tool.pricing}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {similarTools.length > 4 && (
              <Button
                variant="ghost"
                className="w-full gap-2 text-sm"
                onClick={() => router.push(`/?category=${currentTool.category}`)}
              >
                View All Similar Tools
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trending in Category */}
      <Card className="border-chart-4/30 bg-gradient-to-br from-chart-4/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-chart-4" />
            Trending in This Category
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Popular tools others are exploring
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => router.push(`/?category=${currentTool.category}`)}
          >
            <Users className="h-4 w-4" />
            Browse {currentTool.category} Tools
          </Button>
        </CardContent>
      </Card>

      {/* Industry Insights */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Others in Your Industry Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Discover tools commonly paired with this one
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/tools")}
          >
            Explore Tool Directory
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}