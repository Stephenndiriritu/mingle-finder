"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
  subscriptionType: string
  isVerified: boolean
  isActive: boolean
  birthdate?: string
  gender?: string
  location?: string
  bio?: string
  lastActive?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if user is authenticated via API
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include cookies
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
          // Clear any stored user data
          localStorage.removeItem('user')
        }
      } else {
        setUser(null)
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      localStorage.removeItem('user')
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
      // Still clear local state even if API call fails
      localStorage.removeItem('user')
      setUser(null)
      router.push("/")
    }
  }

  const refreshUser = async () => {
    // Refresh user data from database
    await checkAuthStatus()
  }

  // Show loading state only during initial load
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
