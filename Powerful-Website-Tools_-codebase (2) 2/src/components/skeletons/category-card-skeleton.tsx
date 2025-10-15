import { Skeleton } from "@/components/ui/skeleton"

export function CategoryCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
      <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
    </div>
  )
}

export function CategoryCardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  )
}