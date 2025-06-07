"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Users, Shield, Star, Zap, CheckCircle, ArrowRight } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Testimonial {
  id: number
  title: string
  story: string
  photo_url: string
  name: string
  photos: string[]
}

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("register")
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSubmitStory, setShowSubmitStory] = useState(false)
  const [storyForm, setStoryForm] = useState({
    title: "",
    story: "",
    photoUrl: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
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

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storyForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit story")
      }

      setShowSubmitStory(false)
      setStoryForm({ title: "", story: "", photoUrl: "" })
      alert("Your story has been submitted for review!")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit story")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const features = [
    {
      icon: Heart,
      title: "Smart Matching",
      description: "Our advanced algorithm learns your preferences to suggest the most compatible matches.",
      color: "text-red-500",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Connect instantly with your matches through our secure, real-time messaging system.",
      color: "text-blue-500",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your privacy and safety are our top priorities with verified profiles and secure data.",
      color: "text-green-500",
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join millions of active users looking for meaningful relationships and connections.",
      color: "text-purple-500",
    },
    {
      icon: Star,
      title: "Premium Features",
      description: "Unlock advanced features like super likes, boosts, and unlimited swipes with premium.",
      color: "text-yellow-500",
    },
    {
      icon: Zap,
      title: "Instant Connections",
      description: "Get notified instantly when someone likes you back and start chatting immediately.",
      color: "text-orange-500",
    },
  ]

  const stats = [
    { number: "2M+", label: "Active Users" },
    { number: "500K+", label: "Successful Matches" },
    { number: "50K+", label: "Happy Couples" },
    { number: "4.8★", label: "App Rating" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Auth Buttons */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end space-x-4">
          <Button variant="ghost" onClick={() => openAuth("login")} className="text-gray-600 hover:text-pink-600">
            Sign In
          </Button>
          <Button
            onClick={() => openAuth("register")}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-pink-100 text-pink-700 border-pink-200">
            🎉 Over 2 Million Happy Users
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Match Today
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with like-minded people, build meaningful relationships, and discover love in the digital age with
            our advanced matching algorithm.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={() => openAuth("register")}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg px-8 py-4 h-auto"
            >
              Start Dating Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-2">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            ✨ Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose Mingle Finder?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've built the most advanced dating platform with features designed to help you find genuine connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg profile-card"
            >
              <CardHeader>
                <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            🚀 Simple Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to find your perfect match.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Create Profile",
              description: "Sign up and create your detailed profile with photos and interests.",
              icon: Users,
            },
            {
              step: "2",
              title: "Get Matches",
              description: "Our algorithm finds compatible people based on your preferences.",
              icon: Heart,
            },
            {
              step: "3",
              title: "Start Chatting",
              description: "Connect with your matches and start meaningful conversations.",
              icon: MessageCircle,
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Success Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real People, Real Connections
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover how Mingle Finder has brought couples together and created lasting relationships.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <img
                        src={testimonial.photo_url || testimonial.photos[0] || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{testimonial.title}</h3>
                    <p className="text-gray-600 mb-4">{testimonial.story}</p>
                    <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No success stories yet. Be the first to share yours!</p>
          )}

          <div className="text-center mt-8">
            <Button onClick={() => setShowSubmitStory(true)} variant="outline" size="lg">
              Share Your Story
            </Button>
          </div>
        </div>
      </section>

      {/* Submit Story Modal */}
      <Dialog open={showSubmitStory} onOpenChange={setShowSubmitStory}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Share Your Success Story</DialogTitle>
          <DialogDescription>
            Tell us how you found love on Mingle Finder. Your story will be reviewed before being published.
          </DialogDescription>

          <form onSubmit={handleSubmitStory} className="space-y-4 mt-4">
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
              <Label htmlFor="story">Your Story</Label>
              <Textarea
                id="story"
                value={storyForm.story}
                onChange={(e) => setStoryForm(prev => ({ ...prev, story: e.target.value }))}
                placeholder="Share your experience..."
                className="h-32"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL (optional)</Label>
              <Input
                id="photo"
                value={storyForm.photoUrl}
                onChange={(e) => setStoryForm(prev => ({ ...prev, photoUrl: e.target.value }))}
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

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-yellow-100 text-yellow-700 border-yellow-200">
            👑 Premium Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start for free or upgrade to premium for unlimited features and better matches.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Free",
              price: "$0",
              period: "forever",
              features: ["10 likes per day", "Basic matching", "Standard messaging", "Profile creation"],
              popular: false,
              cta: "Get Started",
            },
            {
              name: "Gold",
              price: "$9.99",
              period: "month",
              features: ["100 likes per day", "See who liked you", "5 super likes", "Read receipts", "No ads"],
              popular: true,
              cta: "Go Gold",
            },
            {
              name: "Platinum",
              price: "$19.99",
              period: "month",
              features: [
                "Unlimited likes",
                "Priority matching",
                "10 super likes",
                "Message before matching",
                "Profile boost",
              ],
              popular: false,
              cta: "Go Platinum",
            },
          ].map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? "border-2 border-purple-500 shadow-2xl scale-105" : "border-0 shadow-lg"}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-500">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                <Button
                  className={`w-full mt-6 ${plan.popular ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => openAuth("register")}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Find Love?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy couples who found their perfect match on Mingle Finder. Your soulmate is waiting!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => openAuth("register")}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
            >
              Create Your Profile Now
              <Heart className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 h-auto"
            >
              Download App
            </Button>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
