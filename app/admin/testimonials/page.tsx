"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"

interface Testimonial {
  id: number
  user_id: number
  user_name: string
  user_email: string
  content: string
  is_approved: boolean
  created_at: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all")
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchTestimonials()
  }, [filter, pagination.page])

  const fetchTestimonials = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        filter,
      })

      const response = await fetch(`/api/admin/testimonials?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.testimonials)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestimonialAction = async (testimonialId: number, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_approved: action === "approve",
        }),
      })

      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      console.error("Failed to update testimonial:", error)
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">Unauthorized access</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Testimonials Management</h1>
        <p className="text-gray-600">Review and manage user testimonials</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          onClick={() => setFilter("approved")}
        >
          Approved
        </Button>
      </div>

      <div className="grid gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    {testimonial.user_name}
                  </h3>
                  <Badge
                    variant={testimonial.is_approved ? "success" : "secondary"}
                  >
                    {testimonial.is_approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {testimonial.user_email}
                </p>
                <div className="prose prose-sm max-w-none">
                  <p>{testimonial.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Submitted{" "}
                  {formatDistanceToNow(new Date(testimonial.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {!testimonial.is_approved && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTestimonialAction(testimonial.id, "reject")
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      handleTestimonialAction(testimonial.id, "approve")
                    }
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {testimonials.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No testimonials found</p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 