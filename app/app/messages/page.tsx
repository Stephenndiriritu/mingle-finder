"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, Search } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  match_id: number
  matched_at: string
  user: {
    id: number
    name: string
    photos: string[]
    last_active: string
    is_online: boolean
  }
  last_message: {
    id: number
    content: string
    sent_at: string
    is_read: boolean
  } | null
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter((conv) => 
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/matches")
      if (response.ok) {
        const data = await response.json()
        // Sort by last message time, then by match time
        const sorted = data.matches.sort((a: Conversation, b: Conversation) => {
          const aTime = a.last_message?.sent_at || a.matched_at
          const bTime = b.last_message?.sent_at || b.matched_at
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })
        setConversations(sorted)
        setFilteredConversations(sorted)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No conversations yet</h2>
          <p className="text-gray-600 mb-6">When you match with someone, you can start chatting with them here.</p>
          <Link
            href="/app/matches"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            View Matches
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredConversations.map((conversation) => (
          <Link key={conversation.match_id} href={`/app/messages/${conversation.match_id}`}>
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={conversation.user.photos[0] || "/placeholder.svg?height=60&width=60"}
                      alt={conversation.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.last_message && !conversation.last_message.is_read && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                        New
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conversation.user.name}</h3>
                      <span className="text-xs text-gray-500">
                        {conversation.last_message
                          ? formatDistanceToNow(new Date(conversation.last_message.sent_at), { addSuffix: true })
                          : formatDistanceToNow(new Date(conversation.matched_at), { addSuffix: true })}
                      </span>
                    </div>

                    <p className={`text-sm truncate ${
                      conversation.last_message && !conversation.last_message.is_read 
                        ? "font-medium text-gray-900" 
                        : "text-gray-600"
                    }`}>
                      {conversation.last_message?.content || "Say hello to your new match!"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredConversations.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500">No conversations found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  )
}
