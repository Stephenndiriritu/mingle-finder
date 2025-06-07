"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Eye, EyeOff } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "register"
  onModeChange: (mode: "login" | "register") => void
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    dateOfBirth: "",
    gender: "",
    location: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Validate form data
    const validateForm = () => {
      if (mode === "login") {
        return formData.email.includes("@") && formData.password.length >= 6
      } else {
        return (
          formData.email.includes("@") &&
          formData.password.length >= 6 &&
          formData.name.length >= 2 &&
          formData.dateOfBirth &&
          formData.gender
        )
      }
    }
    setIsValid(validateForm())
  }, [formData, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isLoading) return

    setIsLoading(true)
    setError("")

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // Show success feedback before redirecting
      router.push("/app")
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setError("") // Clear error when user makes changes
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">
          {mode === "login" ? "Sign in to your account" : "Create a new account"}
        </DialogTitle>
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-2xl font-bold">Mingle Finder</span>
            </div>
            <CardTitle>{mode === "login" ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {mode === "login" ? "Sign in to your account to continue" : "Join thousands of people finding love"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner className="mr-2" />
                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => {
                  setError("")
                  setFormData({
                    email: "",
                    password: "",
                    name: "",
                    dateOfBirth: "",
                    gender: "",
                    location: "",
                  })
                  onModeChange(mode === "login" ? "register" : "login")
                }}
                className="text-sm"
                disabled={isLoading}
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
