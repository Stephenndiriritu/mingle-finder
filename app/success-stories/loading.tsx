import { Skeleton } from "@/components/ui/skeleton"

export function SuccessStorySkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
    </>
  )
}

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-10 w-1/3 mx-auto mb-2" />
      <Skeleton className="h-6 w-1/2 mx-auto mb-12" />
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <SuccessStorySkeleton count={6} />
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  )
} 
