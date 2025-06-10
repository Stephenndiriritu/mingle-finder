'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ChatPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatData, setChatData] = useState<any>(null)

  useEffect(() => {
    const loadChatData = async () => {
      try {
        const response = await fetch(`/api/messages/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load chat')
        }
        const data = await response.json()
        setChatData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat')
      } finally {
        setLoading(false)
      }
    }

    loadChatData()
  }, [id])

  useEffect(() => {
    // Mock socket connection for demo
    console.log(`Joining chat ${id}`)

    return () => {
      console.log(`Leaving chat ${id}`)
    }
  }, [id])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  if (!chatData) {
    return <div className="p-4">No chat data found</div>
  }

  return (
    <div className="h-full">
      <ChatWindow
        chatId={id as string}
        recipientId={chatData.recipientId}
        recipientName={chatData.recipientName}
        recipientPhoto={chatData.recipientPhoto}
        messages={chatData.messages}
        isOnline={chatData.isOnline}
        lastActive={chatData.lastActive}
      />
    </div>
  )
} 