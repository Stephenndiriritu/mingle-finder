'use client'

import { useEffect, useRef, useCallback } from "react"
import io, { Socket } from "socket.io-client"
import { useAuth } from "@/components/auth-provider"

interface Message {
  matchId: string
  message: string
  senderId: string
}

interface TypingData {
  matchId: string
  userId: string
}

export function useSocket() {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (user) {
      socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL!, {
        path: '/api/socketio',
      })
    }

    return () => {
      socketRef.current?.disconnect()
    }
  }, [user])

  // Send message
  const sendMessage = useCallback((matchId: string, receiverId: string, message: string) => {
    if (socketRef.current) {
      socketRef.current.emit("send_message", {
        matchId,
        receiverId,
        message
      })
    }
  }, [])

  // Start typing
  const startTyping = useCallback((matchId: string, receiverId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("typing", {
        matchId,
        receiverId
      })
    }
  }, [])

  // Stop typing
  const stopTyping = useCallback((matchId: string, receiverId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("stop_typing", {
        matchId,
        receiverId
      })
    }
  }, [])

  // Subscribe to messages
  const onMessage = useCallback((callback: (data: Message) => void) => {
    if (socketRef.current) {
      socketRef.current.on("receive_message", callback)
      return () => {
        socketRef.current?.off("receive_message", callback)
      }
    }
    return () => {}
  }, [])

  // Subscribe to typing indicators
  const onTyping = useCallback((callback: (data: TypingData) => void) => {
    if (socketRef.current) {
      socketRef.current.on("user_typing", callback)
      return () => {
        socketRef.current?.off("user_typing", callback)
      }
    }
    return () => {}
  }, [])

  // Subscribe to stop typing indicators
  const onStopTyping = useCallback((callback: (data: TypingData) => void) => {
    if (socketRef.current) {
      socketRef.current.on("user_stop_typing", callback)
      return () => {
        socketRef.current?.off("user_stop_typing", callback)
      }
    }
    return () => {}
  }, [])

  return {
    sendMessage,
    startTyping,
    stopTyping,
    onMessage,
    onTyping,
    onStopTyping,
    isConnected: !!socketRef.current?.connected
  }
} 