"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Eye, EyeOff } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "register"
  onModeChange: (mode: "login" | "register") => void
}

interface FormData {
  email: string
  password: string
  name?: string
  dateOfBirth?: string
  gender?: string
  location?: string
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    dateOfBirth: "",
    gender: "",
    location: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null) // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === "login") {
        // Use mock authentication instead of database API
        const mockUsers = {
          'user@minglefinder.com': {
            id: 'e3529410-cb84-4113-931f-907a1e90bc3b',
            email: 'user@minglefinder.com',
            name: 'Test User',
            isAdmin: false,
            subscriptionType: 'free',
            isVerified: false,
            password: 'user123'
          },
          'premium@minglefinder.com': {
            id: 'f4640521-dc95-5224-a42f-a18b2f91cd4c',
            email: 'premium@minglefinder.com',
            name: 'Premium User',
            isAdmin: false,
            subscriptionType: 'premium',
            isVerified: true,
            password: 'premium123'
          },
          'admin@minglefinder.com': {
            id: 'a1751632-ed06-6335-b53f-b29c3g02de5d',
            email: 'admin@minglefinder.com',
            name: 'Admin User',
            isAdmin: true,
            subscriptionType: 'premium_plus',
            isVerified: true,
            password: 'admin123'
          }
        }

        const user = mockUsers[formData.email as keyof typeof mockUsers]

        if (!user || user.password !== formData.password) {
          throw new Error("Invalid email or password")
        }

        const userSession = {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          subscriptionType: user.subscriptionType,
          isVerified: user.isVerified
        }

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userSession))

        // Refresh auth context
        await refreshUser()

        // Redirect based on user role
        if (user.isAdmin) {
          router.push("/admin")
        } else {
          router.push("/app")
        }
        onClose()
      } else {
        // Validate registration fields
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error("Please fill in all required fields")
        }

        if (formData.password.length < 8) {
          throw new Error("Password must be at least 8 characters")
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          throw new Error("Please enter a valid email address")
        }

        // Mock registration - in a real app, this would call the registration API
        // For demo purposes, create a new user session
        const newUser = {
          id: `user-${Date.now()}`, // Generate a simple ID
          email: formData.email,
          name: formData.name,
          isAdmin: false,
          subscriptionType: 'free',
          isVerified: false
        }

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(newUser))

        // Refresh auth context
        await refreshUser()

        // Redirect to app (new users are not admin)
        router.push("/app")
        onClose()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="sr-only">
          {mode === "login" ? "Login to your account" : "Create an account"}
        </DialogTitle>
        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "Welcome back" : "Create an account"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <LoadingSpinner className="mr-2" />
                ) : (
                  <Heart className="mr-2 h-4 w-4" />
                )}
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => onModeChange("register")}
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => onModeChange("login")}
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}


