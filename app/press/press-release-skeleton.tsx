"use client"

export function PressReleaseSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="border-b pb-6">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      ))}
    </div>
  )
} 