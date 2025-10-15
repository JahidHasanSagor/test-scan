import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>

      {/* Content skeleton */}
      <div className="prose prose-lg max-w-none">
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-4/5 mb-6" />
        
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-5/6 mb-6" />
        
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </article>
  );
}