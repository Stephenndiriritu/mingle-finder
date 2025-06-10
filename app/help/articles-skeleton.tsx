"use client"

import { Card } from "@/components/ui/card"

export function ArticlesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Create 5 skeleton cards */}
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            {/* Skeleton title */}
            <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse" />
            
            {/* Skeleton description */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded-md w-full animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-md w-5/6 animate-pulse" />
            </div>
            
            {/* Skeleton badges */}
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 