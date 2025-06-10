"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { AuthModal } from "./auth-modal"

export function TestimonialForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          title,
          story: content,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit testimonial")
      }
      
      toast.success("Your testimonial has been submitted for review!")
      setTitle("")
      setContent("")
      router.refresh()
    } catch (error: any) {
      console.error("Error submitting testimonial:", error)
      toast.error(error.message || "Failed to submit your testimonial. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <>
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Share Your Success Story</h2>
        <p className="text-gray-600 mb-6">
          Found love on Mingle Finder? We'd love to hear your story! Share your experience to inspire others.
        </p>

        {user && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ Logged in as <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={user ? "Give your story a title" : "Please log in to submit a story"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={!user}
              className={!user ? "bg-gray-100 cursor-not-allowed" : ""}
            />
          </div>

          <div>
            <Label htmlFor="content">Your Story</Label>
            <Textarea
              id="content"
              placeholder={user ? "Tell us how you found love on Mingle Finder..." : "Please log in to share your story"}
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={!user}
              className={`resize-none ${!user ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !user}
          >
            {isSubmitting ? "Submitting..." : !user ? "Login Required" : "Submit Your Story"}
          </Button>

          {!user && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600 mr-2">🔒</span>
                <h3 className="font-semibold text-yellow-800">Authentication Required</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                You need to be logged in to submit a testimonial. This helps us verify authentic success stories.
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login")
                    setShowAuthModal(true)
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register")
                    setShowAuthModal(true)
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {user && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Your testimonial will be reviewed before being published.
            </div>
          )}
        </form>
      </Card>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}
