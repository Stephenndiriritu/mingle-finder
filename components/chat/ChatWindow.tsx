'use client'

import { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/components/auth-provider'
import { formatDistanceToNow } from 'date-fns'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: number
  message: string
  sender_id: number
  receiver_id: number
  sender_name: string
  created_at: string
  is_read: boolean
}

interface ChatWindowProps {
  chatId: string // This can be either matchId or conversationId
  recipientId: number
  recipientName: string
  recipientPhoto: string
  messages: Message[]
  isOnline: boolean
  lastActive: string
  isConversation?: boolean // true for direct conversations, false for match-based chats
}

export function ChatWindow({
  chatId,
  recipientId,
  recipientName,
  recipientPhoto,
  messages: initialMessages,
  isOnline,
  lastActive,
  isConversation = false,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isConnected } = useSocket()
  const { user } = useAuth()

  // Mock socket for demo
  const socket = {
    emit: (event: string, data: any) => {
      console.log(`Socket emit: ${event}`, data)
    },
    on: (event: string, handler: (data: any) => void) => {
      console.log(`Socket listening to: ${event}`)
    },
    off: (event: string, handler?: (data: any) => void) => {
      console.log(`Socket stopped listening to: ${event}`)
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    // Mock socket event listeners for demo
    console.log('Setting up socket listeners for chat')

    return () => {
      console.log('Cleaning up socket listeners')
    }
  }, [socket])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      // Send message via API - use different endpoints for conversations vs matches
      const apiUrl = isConversation ? `/api/conversations/${chatId}` : '/api/messages'
      const requestBody = isConversation
        ? { message: newMessage }
        : {
            match_id: chatId,
            receiver_id: recipientId,
            message: newMessage,
            user_id: user?.id
          }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok) {
        // Add the new message to the local state
        setMessages(prev => [...prev, data.message])
        setNewMessage('')

        // Mock socket emit for real-time updates
        console.log('Mock socket: sending message', {
          chatId,
          recipientId,
          message: newMessage
        })
      } else if (data.code === 'SUBSCRIPTION_REQUIRED') {
        // Handle subscription required error
        toast.error(data.message)
        // Optionally redirect to payment page
        setTimeout(() => {
          window.location.href = '/app/payment'
        }, 2000)
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleTyping = () => {
    // Mock typing indicators for demo
    console.log('Mock typing indicator:', { chatId, recipientId })
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b">
        <div className="relative">
          <img
            src={recipientPhoto || '/default-avatar.png'}
            alt={recipientName}
            className="w-10 h-10 rounded-full"
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="ml-3">
          <h3 className="font-semibold">{recipientName}</h3>
          <p className="text-sm text-muted-foreground">
            {isOnline ? 'Online' : `Last active ${formatDistanceToNow(new Date(lastActive))} ago`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === recipientId ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === recipientId
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <p>{message.message}</p>
              <span className="text-xs opacity-70">
                {formatDistanceToNow(new Date(message.created_at))} ago
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
              <p className="text-sm">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] bg-secondary/50 border-0 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary text-primary-foreground rounded-md p-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
} 