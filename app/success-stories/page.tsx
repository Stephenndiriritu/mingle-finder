"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, Star, Quote } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Story {
  id: number
  title: string
  story: string
  couple: string
  location: string
  date: string
  image: string
  rating: number
}

export default function SuccessStoriesPage() {
  const [showSubmitStory, setShowSubmitStory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [storyForm, setStoryForm] = useState({
    title: "",
    story: "",
    couple: "",
    location: "",
    image: ""
  })

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/success-stories")
      if (!response.ok) throw new Error("Failed to fetch stories")
      const data = await response.json()
      setStories(data)
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/success-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyForm.title,
          story: storyForm.story,
          location: storyForm.location
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit story")
      }

      setShowSubmitStory(false)
      setStoryForm({ title: "", story: "", couple: "", location: "", image: "" })
      
      // Show success message
      alert("Thank you for sharing your story! It will be reviewed and published soon.")
      
      // Refresh stories
      fetchStories()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit story")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Success Stories</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Real Love Stories from
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Our Community
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover how Mingle Finder has helped couples find their perfect match and create lasting relationships.
          </p>
          <Button
            onClick={() => setShowSubmitStory(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600"
          >
            Share Your Story
            <Heart className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Success Stories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="aspect-[4/3] bg-gray-100 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{story.date}</span>
                </div>
                <Quote className="h-8 w-8 text-pink-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                <p className="text-gray-600 mb-4">{story.story}</p>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{story.couple}</p>
                  <p className="text-gray-500">{story.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Story Modal */}
        <Dialog open={showSubmitStory} onOpenChange={setShowSubmitStory}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Share Your Success Story</DialogTitle>
            <DialogDescription>
              Tell us how you found love on Mingle Finder. Your story will inspire others in their journey to find love.
            </DialogDescription>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your story a title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="couple">Your Names</Label>
                <Input
                  id="couple"
                  value={storyForm.couple}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, couple: e.target.value }))}
                  placeholder="e.g., Sarah & Michael"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={storyForm.location}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., New York, NY"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">Your Story</Label>
                <Textarea
                  id="story"
                  value={storyForm.story}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, story: e.target.value }))}
                  placeholder="Share your love story..."
                  className="h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Photo URL (optional)</Label>
                <Input
                  id="image"
                  value={storyForm.image}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Link to a photo of you both"
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {submitError}
                </p>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowSubmitStory(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner className="mr-2" /> : null}
                  Submit Story
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 