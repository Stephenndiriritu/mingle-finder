import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/components/auth-provider'

// Simplified socket implementation for demo
interface MockSocket {
  emit: (event: string, data: any, callback?: (response: any) => void) => void
  on: (event: string, handler: (data: any) => void) => void
  off: (event: string, handler?: (data: any) => void) => void
}

interface MessageData {
  id: number
  match_id: number
  sender_id: number
  receiver_id: number
  message: string
  created_at: string
  is_read: boolean
}

interface TypingData {
  match_id: number
  user_id: number
  isTyping: boolean
}

type MessageHandler = (message: MessageData) => void
type TypingHandler = (data: TypingData) => void
type ConnectionHandler = (status: boolean) => void

export function useSocket() {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<MockSocket | null>(null)
  const messageHandlers = useRef<Set<MessageHandler>>(new Set())
  const typingHandlers = useRef<Set<TypingHandler>>(new Set())
  const connectionHandlers = useRef<Set<ConnectionHandler>>(new Set())

  // Initialize mock socket connection
  useEffect(() => {
    if (!user) return

    // Create mock socket for demo
    if (!socketRef.current) {
      socketRef.current = {
        emit: (event: string, data: any, callback?: (response: any) => void) => {
          console.log(`Socket emit: ${event}`, data)

          // Simulate async response
          if (callback) {
            setTimeout(() => {
              callback({ success: true, message: 'Mock response' })
            }, 100)
          }
        },
        on: (event: string, handler: (data: any) => void) => {
          console.log(`Socket listening to: ${event}`)
        },
        off: (event: string, handler?: (data: any) => void) => {
          console.log(`Socket stopped listening to: ${event}`)
        }
      }
    }

    // Simulate connection
    setTimeout(() => {
      console.log('Mock socket connected')
      setIsConnected(true)
      connectionHandlers.current.forEach(handler => handler(true))
    }, 1000)

    return () => {
      console.log('Mock socket cleanup')
    }
  }, [user])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        setIsConnected(false)
        socketRef.current = null
      }
    }
  }, [])

  // Send a message
  const sendMessage = useCallback((matchId: number, receiverId: number, message: string): Promise<MessageData> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        // Fallback to API if socket is not connected
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ match_id: matchId, receiver_id: receiverId, message })
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to send message')
          return response.json()
        })
        .then(data => resolve(data.message))
        .catch(error => reject(error))
        return
      }

      // Use socket for real-time delivery
      socketRef.current.emit('send_message', { match_id: matchId, receiver_id: receiverId, message }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.message)
        }
      })
    })
  }, [isConnected])

  // Send typing indicator
  const sendTyping = useCallback((matchId: number, isTyping: boolean) => {
    if (!socketRef.current || !isConnected) return
    
    socketRef.current.emit('typing', {
      match_id: matchId,
      isTyping
    })
  }, [isConnected])

  // Subscribe to new messages
  const onNewMessage = useCallback((handler: MessageHandler) => {
    messageHandlers.current.add(handler)
    
    return () => {
      messageHandlers.current.delete(handler)
    }
  }, [])

  // Subscribe to typing indicators
  const onTyping = useCallback((handler: TypingHandler) => {
    typingHandlers.current.add(handler)
    
    return () => {
      typingHandlers.current.delete(handler)
    }
  }, [])

  // Subscribe to connection status changes
  const onConnectionChange = useCallback((handler: ConnectionHandler) => {
    connectionHandlers.current.add(handler)
    
    return () => {
      connectionHandlers.current.delete(handler)
    }
  }, [])

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log('Mock socket reconnect')
    setIsConnected(true)
  }, [])

  return {
    isConnected,
    sendMessage,
    sendTyping,
    onNewMessage,
    onTyping,
    onConnectionChange,
    reconnect
  }
}


