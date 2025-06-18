'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'

interface MessageUserButtonProps {
  userId: string
  userName: string
  userPhoto?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function MessageUserButton({ 
  userId, 
  userName, 
  userPhoto,
  variant = 'default',
  size = 'default',
  className = ''
}: MessageUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setSending(true)
    try {
      const response = await fetch(`/api/users/${userId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Message sent!')
        setIsOpen(false)
        setMessage('')
        // Redirect to the conversation
        router.push(`/app/conversations/${data.conversationId}`)
      } else if (data.code === 'SUBSCRIPTION_REQUIRED') {
        toast.error(data.message)
        setIsOpen(false)
        // Redirect to payment page after a delay
        setTimeout(() => {
          router.push('/app/payment')
        }, 1500)
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleStartConversation = async () => {
    // Check if conversation already exists
    try {
      const response = await fetch(`/api/users/${userId}/message`)
      const data = await response.json()

      if (response.ok && data.exists) {
        // Conversation exists, redirect to it
        router.push(`/app/conversations/${data.conversationId}`)
      } else {
        // No conversation exists, open dialog to send first message
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Error checking conversation:', error)
      // If there's an error, just open the dialog
      setIsOpen(true)
    }
  }

  // Don't show button for current user
  if (parseInt(userId) === user?.id) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center space-x-2 ${className}`}
          onClick={handleStartConversation}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Message</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {userPhoto && (
              <img 
                src={userPhoto} 
                alt={userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <span>Send message to {userName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Your message
            </label>
            <Textarea
              id="message"
              placeholder={`Say hello to ${userName}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              className="flex-1"
            >
              {sending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </div>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              {user?.subscriptionType === 'free' ? (
                <span className="text-amber-600">
                  ⚠️ Premium subscription required to send messages
                </span>
              ) : (
                'Your message will be delivered instantly'
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
