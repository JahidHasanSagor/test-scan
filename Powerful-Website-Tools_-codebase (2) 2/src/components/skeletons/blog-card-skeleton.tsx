import { Skeleton } from "@/components/ui/skeleton"

export function BlogCardSkeleton() {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
      {/* Featured Image */}
      <Skeleton className="h-48 w-full rounded-lg" />
      
      {/* Category Badge */}
      <Skeleton className="h-5 w-24 rounded-full" />
      
      {/* Title */}
      <Skeleton className="h-7 w-full" />
      <Skeleton className="h-7 w-3/4" />
      
      {/* Excerpt */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </article>
  )
}

export function BlogCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  )
}