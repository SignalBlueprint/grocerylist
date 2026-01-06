'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="flex gap-1 mt-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-10" />
      </div>
      <Skeleton className="h-3 w-1/3 mt-2" />
    </div>
  );
}

export function RecipeListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GroceryItemSkeleton() {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <Skeleton className="w-5 h-5 rounded" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

export function GroceryCategorySkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <GroceryItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function GroceryListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <GroceryCategorySkeleton key={i} />
      ))}
    </div>
  );
}

export function AppSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <RecipeListSkeleton />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex-1 flex items-center justify-center h-64">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
