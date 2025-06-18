'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'

interface ConversationData {
  conversationId: string
  recipientId: string
  recipientName: string
  recipientPhoto: string
  isOnline: boolean
  lastActive: string
  isBlocked: boolean
  blockedBy: string | null
  messages: any[]
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [conversationData, setConversationData] = useState<ConversationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const conversationId = params.conversationId as string

  useEffect(() => {
    if (!conversationId) return

    fetchConversationData()
  }, [conversationId])

  const fetchConversationData = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      const data = await response.json()

      if (response.ok) {
        setConversationData(data)
      } else if (response.status === 404) {
        setError('Conversation not found')
      } else if (response.status === 401) {
        setError('You need to be logged in to view this conversation')
        router.push('/login')
      } else {
        setError(data.error || 'Failed to load conversation')
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      setError('Failed to load conversation')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/app/conversations')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Conversations
          </Button>
        </div>
      </div>
    )
  }

  if (!conversationData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
          <p className="text-gray-600 mb-4">This conversation may have been deleted or you don't have access to it.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Conversations
          </Button>
        </div>
      </div>
    )
  }

  // Check if conversation is blocked
  if (conversationData.isBlocked) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Conversation Blocked</h2>
          <p className="text-gray-600 mb-4">
            {conversationData.blockedBy === user?.id?.toString()
              ? 'You have blocked this user.'
              : 'This user has blocked you.'}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Conversations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile header with back button */}
      <div className="md:hidden flex items-center p-4 border-b bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mr-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-semibold">Back to Conversations</h1>
      </div>

      {/* Chat window */}
      <div className="flex-1">
        <ChatWindow
          chatId={conversationData.conversationId}
          recipientId={parseInt(conversationData.recipientId)}
          recipientName={conversationData.recipientName}
          recipientPhoto={conversationData.recipientPhoto}
          messages={conversationData.messages}
          isOnline={conversationData.isOnline}
          lastActive={conversationData.lastActive}
          isConversation={true}
        />
      </div>
    </div>
  )
}
