"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, MoreVertical, Flag, UserX } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { io } from "socket.io-client"

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  message: string
  created_at: string
  sender_name: string
}

interface MatchInfo {
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

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const matchId = params.matchId as string
  const socketRef = useRef<any>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)

  // Initialize WebSocket connection
  useEffect(() => {
    if (!matchId || !user?.id) return

    // Connect to WebSocket server
    socketRef.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3000", {
      path: "/api/socket",
      addTrailingSlash: false,
      auth: {
        userId: user.id
      }
    })

    // Handle connection
    socketRef.current.on("connect", () => {
      console.log("Socket connected")
      setIsSocketConnected(true)
      // Join the chat room
      socketRef.current.emit("join_chat", { matchId })
    })

    // Handle new messages
    socketRef.current.on("new_message", (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    // Handle typing indicators
    socketRef.current.on("user_typing", (data: { userId: number }) => {
      if (data.userId === matchInfo?.user.id) {
        // Show typing indicator
      }
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [matchId, user?.id])

  // Optimize message fetching with pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const MESSAGES_PER_PAGE = 20

  const fetchMessages = async (pageNum = 1) => {
    try {
      setIsLoadingMore(true)
      const response = await fetch(`/api/messages/${params.matchId}?page=${pageNum}&limit=${MESSAGES_PER_PAGE}`)
      if (response.ok) {
        const data = await response.json()
        if (pageNum === 1) {
          setMessages(data.messages)
        } else {
          setMessages(prev => [...data.messages, ...prev])
        }
        setHasMore(data.messages.length === MESSAGES_PER_PAGE)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Handle scroll to load more messages
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container || isLoadingMore || !hasMore) return

    const isNearTop = container.scrollTop < 100
    if (isNearTop) {
      setPage(prev => prev + 1)
      fetchMessages(page + 1)
    }
  }

  useEffect(() => {
    if (matchId) {
      fetchMessages()
      fetchMatchInfo()
    }
  }, [matchId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMatchInfo = async () => {
    try {
      const response = await fetch(`/api/matches/${params.matchId}`)
      if (response.ok) {
        const data = await response.json()
        setMatchInfo(data.match)
      }
    } catch (error) {
      console.error("Failed to fetch match info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Optimize sending messages with optimistic updates
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matchInfo || !newMessage.trim() || isSending) return

    setIsSending(true)
    setError("")

    // Create optimistic message
    const optimisticMessage: Message = {
      id: Date.now(), // Temporary ID
      sender_id: user?.id || 0,
      receiver_id: matchInfo.user.id,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      sender_name: user?.name || "",
    }

    // Add message optimistically
    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage("")

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          match_id: matchInfo.match_id,
          receiver_id: matchInfo.user.id,
          message: optimisticMessage.message,
        }),
      })

      if (!response.ok) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
        throw new Error("Failed to send message")
      }

      const data = await response.json()
      // Update the optimistic message with the real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? { ...data.message, sender_name: user?.name || "" } : msg
        )
      )

      // Emit the message through WebSocket
      if (isSocketConnected) {
        socketRef.current.emit("send_message", data.message)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send message")
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleReport = async () => {
    if (!matchInfo) return

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedUserId: matchInfo.user.id,
          reason: "inappropriate_behavior",
          description: "Reported from chat",
        }),
      })

      if (response.ok) {
        alert("User reported successfully")
      }
    } catch (error) {
      console.error("Failed to report user:", error)
    }
  }

  const handleBlock = async () => {
    if (!matchInfo) return

    if (confirm(`Are you sure you want to block ${matchInfo.user.name}?`)) {
      try {
        const response = await fetch("/api/blocks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blockedUserId: matchInfo.user.id,
            reason: "blocked_from_chat",
          }),
        })

        if (response.ok) {
          router.push("/app/messages")
        }
      } catch (error) {
        console.error("Failed to block user:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!matchInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Match not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img
              src={matchInfo.user.photos[0] || "/placeholder.svg?height=40&width=40"}
              alt={matchInfo.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-gray-900">{matchInfo.user.name}</h2>
              <p className="text-sm text-gray-500">
                {matchInfo.user.is_online ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  <span>Last active {formatDistanceToNow(new Date(matchInfo.user.last_active), { addSuffix: true })}</span>
                )}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlock} className="text-red-600">
                <UserX className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoadingMore && (
          <div className="text-center py-2">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="max-w-sm mx-auto">
              <img
                src={matchInfo.user.photos[0] || "/placeholder.svg?height=100&width=100"}
                alt={matchInfo.user.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="font-semibold text-gray-900 mb-2">You matched with {matchInfo.user.name}!</h3>
              <p className="text-sm text-gray-600 mb-4">Start the conversation and say hello.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${message.sender_id === user?.id ? "text-blue-100" : "text-gray-500"}`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                setError("")
              }}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isSending}
            />
            <Button 
              type="submit" 
              disabled={isSending || !newMessage.trim()}
              className={cn(
                "transition-all duration-200",
                isSending && "opacity-70"
              )}
            >
              {isSending ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
