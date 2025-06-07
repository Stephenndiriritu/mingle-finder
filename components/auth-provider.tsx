"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

interface User {
  id: number
  email: string
  name: string
  is_admin: boolean
  subscription_type?: string
  is_verified?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
        router.push("/")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.status}`)
      }

      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
      setUser(null)
      router.push("/")
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, isLoading, logout, refreshUser }}>{children}</AuthContext.Provider>
}
