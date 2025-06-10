"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

export function EmailVerificationBanner() {
  const [isSending, setIsSending] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  if (user?.isVerified) return null

  const handleSendVerification = async () => {
    setIsSending(true)

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST"
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast({
        title: "Success",
        description: "Verification email sent. Please check your inbox."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification email",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Please verify your email address to access all features.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendVerification}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Resend Verification"}
          </Button>
        </div>
      </div>
    </div>
  )
} 