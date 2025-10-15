import { Skeleton } from "@/components/ui/skeleton";

export default function ToolDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section skeleton */}
      <div className="mb-8">
        <div className="flex items-start gap-6 mb-6">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-10 w-2/3 mb-3" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-11" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4 mb-6" />
          
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-2 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        
        <div>
          <Skeleton className="h-64 w-full rounded-lg mb-6" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}