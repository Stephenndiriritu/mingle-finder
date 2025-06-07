"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  MessageCircle,
  Shield,
  Key,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  Heart
} from "lucide-react"
import { useState, useRef } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const searchTimeout = useRef<NodeJS.Timeout>()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // Don't search if query is empty
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Debounce search
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true)
      setError("")

      try {
        const response = await fetch(`/api/help/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error("Failed to search articles")
        const results = await response.json()
        setSearchResults(results)
      } catch (error) {
        console.error("Search error:", error)
        setError("Failed to search articles")
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  const categories = [
    {
      icon: Shield,
      title: "Account Security",
      description: "Password reset, account verification, and privacy settings",
      articles: [
        "How to reset your password",
        "Two-factor authentication setup",
        "Privacy settings guide"
      ]
    },
    {
      icon: Heart,
      title: "Dating & Matching",
      description: "Profile setup, matching preferences, and messaging",
      articles: [
        "Creating an attractive profile",
        "Understanding the matching algorithm",
        "Messaging tips and guidelines"
      ]
    },
    {
      icon: CreditCard,
      title: "Billing & Subscription",
      description: "Payment methods, subscription plans, and refunds",
      articles: [
        "Managing your subscription",
        "Payment methods accepted",
        "Refund policy"
      ]
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Email preferences, push notifications, and alerts",
      articles: [
        "Notification settings guide",
        "Email preferences setup",
        "Push notification troubleshooting"
      ]
    },
    {
      icon: Settings,
      title: "Technical Support",
      description: "App issues, bugs, and technical troubleshooting",
      articles: [
        "Common app issues and fixes",
        "Device compatibility",
        "App performance tips"
      ]
    },
    {
      icon: MessageCircle,
      title: "Community Guidelines",
      description: "Rules, reporting, and safety guidelines",
      articles: [
        "Community rules overview",
        "How to report users",
        "Safety tips for dating"
      ]
    }
  ]

  const popularArticles = [
    "How to create a standout dating profile",
    "Understanding your match score",
    "Tips for safe online dating",
    "Subscription plan comparison",
    "How to report inappropriate behavior",
    "Photo guidelines and requirements"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Help Center</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Can We
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Help You?
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions and learn how to make the most of your dating experience.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-12">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for help articles..."
              className="pl-12 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-4 top-3">
                <LoadingSpinner className="h-5 w-5" />
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Search Results</h2>
              {error ? (
                <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
              ) : searchResults.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {searchResults.map((article) => (
                    <Button
                      key={article.id}
                      variant="outline"
                      className="justify-start h-auto py-4 px-6"
                    >
                      <HelpCircle className="h-5 w-5 mr-2 text-pink-500" />
                      {article.title}
                    </Button>
                  ))}
                </div>
              ) : !isSearching && (
                <p className="text-gray-600">No articles found matching your search.</p>
              )}
            </div>
          )}
        </div>

        {/* Show other sections only when not searching */}
        {!searchQuery && (
          <>
            {/* Popular Articles */}
            <div className="mb-20">
              <h2 className="text-2xl font-bold mb-8">Popular Articles</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {popularArticles.map((article, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-4 px-6"
                  >
                    <HelpCircle className="h-5 w-5 mr-2 text-pink-500" />
                    {article}
                  </Button>
                ))}
              </div>
            </div>

            {/* Help Categories */}
            <div className="mb-20">
              <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <category.icon className="h-8 w-8 text-pink-500 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <div className="space-y-2">
                        {category.articles.map((article, articleIndex) => (
                          <Button
                            key={articleIndex}
                            variant="link"
                            className="p-0 h-auto text-pink-600 hover:text-pink-700 block text-left"
                          >
                            {article}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Contact Support */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="mb-6">
                Our support team is available 24/7 to assist you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary">Contact Support</Button>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                  Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 