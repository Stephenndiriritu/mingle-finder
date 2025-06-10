"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDistanceToNow } from "date-fns"
import { useSocket } from "@/hooks/useSocket"

interface Match {
  match_id: number
  user: {
    id: number
    name: string
    photos: string[]
  }
  last_message: {
    message: string
    created_at: string
    is_read: boolean
    sender_id: number
  } | null
  unread_count: number
}

export default function MessagesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { isConnected, onNewMessage } = useSocket()

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matches?with_messages=true")
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
        setFilteredMatches(data.matches)
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      setMatches(prevMatches => {
        return prevMatches.map(match => {
          // Find the match this message belongs to
          if (
            (match.user.id === message.sender_id) || 
            (match.user.id === message.receiver_id)
          ) {
            // Update the match with the new message
            return {
              ...match,
              last_message: {
                message: message.message,
                created_at: message.created_at,
                is_read: message.sender_id !== match.user.id, // If we sent it, it's read
                sender_id: message.sender_id
              },
              unread_count: message.sender_id === match.user.id 
                ? match.unread_count + 1 
                : match.unread_count
            }
          }
          return match
        }).sort((a, b) => {
          // Sort by last message time (most recent first)
          const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0
          const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0
          return timeB - timeA
        })
      })
    })

    return unsubscribe
  }, [onNewMessage])

  // Filter matches based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMatches(matches)
      return
    }

    const filtered = matches.filter(match => 
      match.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMatches(filtered)
  }, [searchQuery, matches])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleMatchClick = (matchId: number) => {
    router.push(`/app/messages/${matchId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-gray-600 text-sm mt-1">
              {filteredMatches.length} {filteredMatches.length === 1 ? 'conversation' : 'conversations'}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </div>
            ) : (
              <div className="flex items-center text-gray-500 text-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Offline
              </div>
            )}
          </div>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-4">
            <p className="text-sm">
              You're currently offline. Messages will be sent when you reconnect.
            </p>
          </div>
        )}
        
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? "No conversations match your search" : "Start swiping to match and chat with new people"}
            </p>
            <Button
              onClick={() => router.push('/app/discover')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Discover People
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMatches.map((match) => (
              <div
                key={match.match_id}
                onClick={() => handleMatchClick(match.match_id)}
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={match.user.photos[0] || "/placeholder.svg?height=48&width=48"}
                    alt={match.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {match.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {match.unread_count}
                    </span>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{match.user.name}</h3>
                    {match.last_message && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(match.last_message.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${match.unread_count > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {match.last_message ? (
                      <>
                        {match.last_message.sender_id !== match.user.id && "You: "}
                        {match.last_message.message}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">New match</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


