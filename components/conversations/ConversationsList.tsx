'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Search, Plus, Clock, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    photo: string
    lastActive: string
    isOnline: boolean
  }
  lastMessage: {
    content: string
    senderId: string
    createdAt: string
    isFromMe: boolean
  } | null
  unreadCount: number
  isBlocked: boolean
  blockedBy: string | null
  createdAt: string
  lastMessageAt: string | null
}

export function ConversationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [newUserSearch, setNewUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()

      if (response.ok) {
        setConversations(data.conversations || [])
      } else {
        toast.error('Failed to load conversations')
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearchingUsers(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (response.ok) {
        // Filter out current user and users already in conversations
        const existingUserIds = conversations.map(c => c.otherUser.id)
        const filteredResults = (data.users || []).filter((u: any) =>
          u.id !== user?.id && !existingUserIds.includes(u.id)
        )
        setSearchResults(filteredResults)
      } else {
        toast.error('Failed to search users')
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setSearchingUsers(false)
    }
  }

  const startConversation = async (targetUserId: string) => {
    try {
      const response = await fetch(`/api/users/${targetUserId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }) // Empty message just creates conversation
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Conversation started!')
        router.push(`/app/conversations/${data.conversationId}`)
      } else if (data.code === 'SUBSCRIPTION_REQUIRED') {
        toast.error(data.message)
        router.push('/app/payment')
      } else {
        toast.error(data.error || 'Failed to start conversation')
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast.error('Failed to start conversation')
    }
  }

  const openConversation = (conversationId: string) => {
    router.push(`/app/conversations/${conversationId}`)
  }

  const filteredConversations = (conversations || []).filter(conversation =>
    conversation?.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button
          onClick={() => setShowNewConversation(!showNewConversation)}
          size="sm"
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Search conversations */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* New conversation search */}
      {showNewConversation && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Start New Conversation</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users to message..."
                value={newUserSearch}
                onChange={(e) => {
                  setNewUserSearch(e.target.value)
                  searchUsers(e.target.value)
                }}
                className="pl-10"
              />
            </div>

            {searchingUsers && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => startConversation(searchUser.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={searchUser.photo} alt={searchUser.name} />
                        <AvatarFallback>{searchUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{searchUser.name}</p>
                        <p className="text-sm text-gray-500">{searchUser.location || 'User'}</p>
                      </div>
                    </div>
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}

            {newUserSearch && !searchingUsers && searchResults.length === 0 && (
              <p className="text-center text-gray-500 py-4">No users found</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversations list */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-gray-500 mb-4">
              Start chatting with other users to see your conversations here
            </p>
            <Button onClick={() => setShowNewConversation(true)}>
              Start Your First Conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openConversation(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.otherUser.photo} alt={conversation.otherUser.name} />
                      <AvatarFallback>{conversation.otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {conversation.otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{conversation.otherUser.name}</h3>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessage.createdAt))} ago
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage ? (
                          <>
                            {conversation.lastMessage.isFromMe && (
                              <CheckCheck className="h-3 w-3 inline mr-1" />
                            )}
                            {conversation.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic">No messages yet</span>
                        )}
                      </p>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        {conversation.otherUser.isOnline ? (
                          <span className="text-green-600">Online</span>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(conversation.otherUser.lastActive))} ago</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
