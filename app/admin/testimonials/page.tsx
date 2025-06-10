"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { toast } from "react-hot-toast"

interface Testimonial {
  id: number
  title: string
  story: string
  user_id: number
  user_name: string
  user_email: string
  created_at: string
  is_approved: boolean
  is_featured: boolean
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/admin/testimonials")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.testimonials)
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestimonialAction = async (testimonialId: number, action: "approve" | "reject" | "unapprove" | "feature" | "unfeature") => {
    try {
      const isApprove = action === "approve"
      const isReject = action === "reject"
      const isUnapprove = action === "unapprove"
      const isFeature = action === "feature"

      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_approved: isApprove ? true : (isReject || isUnapprove ? false : undefined),
          is_featured: isFeature ? true : (action === "unfeature" ? false : undefined),
        }),
      })

      if (response.ok) {
        const actionText = action === "unapprove" ? "unapproved" : `${action}d`
        toast.success(`Testimonial ${actionText} successfully`)
        fetchTestimonials()
      } else {
        const actionText = action === "unapprove" ? "unapprove" : action
        toast.error(`Failed to ${actionText} testimonial`)
      }
    } catch (error) {
      console.error(`Error ${action}ing testimonial:`, error)
      const actionText = action === "unapprove" ? "unapprove" : action
      toast.error(`Failed to ${actionText} testimonial`)
    }
  }

  if (!user?.isAdmin) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Testimonials</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2 py-1">
            {testimonials.filter(t => !t.is_approved).length} Pending
          </Badge>
          <Badge variant="outline" className="px-2 py-1">
            {testimonials.filter(t => t.is_approved).length} Approved
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {testimonials.length === 0 ? (
          <Card className="p-6 text-center">
            <p
              className="!text-gray-500"
              style={{ minHeight: "200px" }}
            >
              No testimonials found
            </p>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
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
                    <p>{testimonial.story}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Submitted{" "}
                    {formatDistanceToNow(new Date(testimonial.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!testimonial.is_approved ? (
                    // Buttons for pending testimonials
                    <>
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
                    </>
                  ) : (
                    // Buttons for approved testimonials
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleTestimonialAction(testimonial.id, "unapprove")
                        }
                      >
                        Unapprove
                      </Button>
                      {testimonial.is_featured ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleTestimonialAction(testimonial.id, "unfeature")
                          }
                        >
                          Unfeature
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleTestimonialAction(testimonial.id, "feature")
                          }
                        >
                          Feature
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 
