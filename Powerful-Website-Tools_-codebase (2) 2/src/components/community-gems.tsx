"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ExternalLink, Sparkles, TrendingUp } from "lucide-react";

type Gem = {
  id: string;
  title: string;
  description: string;
  url: string;
  votes: number;
  category: string;
  submittedBy: string;
  submittedDate: string;
};

const mockGems: Gem[] = [
  {
    id: "1",
    title: "Notion AI",
    description: "AI-powered workspace for notes, docs, and wikis with smart suggestions",
    url: "https://notion.so",
    votes: 342,
    category: "Productivity",
    submittedBy: "Sarah Chen",
    submittedDate: "2 days ago"
  },
  {
    id: "2",
    title: "Midjourney",
    description: "Create stunning AI-generated artwork from text descriptions",
    url: "https://midjourney.com",
    votes: 287,
    category: "Design",
    submittedBy: "Alex Kim",
    submittedDate: "5 days ago"
  },
  {
    id: "3",
    title: "Claude AI",
    description: "Advanced conversational AI assistant for research and writing",
    url: "https://claude.ai",
    votes: 256,
    category: "AI Assistant",
    submittedBy: "Maya Patel",
    submittedDate: "1 week ago"
  },
  {
    id: "4",
    title: "Runway ML",
    description: "AI-powered video editing and content generation platform",
    url: "https://runwayml.com",
    votes: 198,
    category: "Video",
    submittedBy: "Jordan Lee",
    submittedDate: "3 days ago"
  }
];

export default function CommunityGems() {
  const [gems, setGems] = React.useState<Gem[]>(mockGems);
  const [votedIds, setVotedIds] = React.useState<Set<string>>(new Set());

  const handleVote = React.useCallback((id: string) => {
    if (votedIds.has(id)) {
      // Unvote
      setGems((prev) => prev.map((g) => g.id === id ? { ...g, votes: g.votes - 1 } : g));
      setVotedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      // Vote
      setGems((prev) => prev.map((g) => g.id === id ? { ...g, votes: g.votes + 1 } : g));
      setVotedIds((prev) => new Set(prev).add(id));
    }
  }, [votedIds]);

  const sortedGems = React.useMemo(() => {
    return [...gems].sort((a, b) => b.votes - a.votes);
  }, [gems]);

  return (
    <section className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 h-1.5 w-32 rounded-full bg-gradient-to-r from-chart-2 via-chart-4 to-chart-5" />
          <h2 className="text-2xl font-bold flex items-center gap-2 sm:text-3xl">
            <Sparkles className="h-6 w-6 text-chart-2" />
            Community Gems
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hidden tools discovered and upvoted by our community
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Live Voting
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {sortedGems.map((gem, index) => {
            const isVoted = votedIds.has(gem.id);
            return (
              <motion.div
                key={gem.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all"
              >
                {/* Rank Badge */}
                {index < 3 && (
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        index === 1 ? 'bg-secondary/80 text-foreground' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                )}

                {/* Vote Button */}
                <motion.button
                  onClick={() => handleVote(gem.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`mb-3 flex flex-col items-center gap-1 rounded-md border px-3 py-2 transition-all ${
                    isVoted
                      ? 'border-chart-2 bg-chart-2/10 text-chart-2'
                      : 'border-border bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label={isVoted ? 'Remove vote' : 'Upvote'}
                >
                  <ChevronUp className={`h-5 w-5 ${isVoted ? 'fill-current' : ''}`} />
                  <span className="text-sm font-bold">{gem.votes}</span>
                </motion.button>

                {/* Content */}
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {gem.category}
                  </Badge>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                    {gem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {gem.description}
                  </p>
                  <div className="pt-2 text-xs text-muted-foreground">
                    By {gem.submittedBy} • {gem.submittedDate}
                  </div>
                </div>

                {/* Visit Link */}
                <a
                  href={gem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Visit tool
                  <ExternalLink className="h-3 w-3" />
                </a>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}