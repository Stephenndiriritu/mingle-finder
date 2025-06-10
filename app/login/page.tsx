'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heart, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/app'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Demo credentials helper
  const fillDemoCredentials = (type: 'user' | 'premium' | 'admin') => {
    const credentials = {
      user: { email: 'user@minglefinder.com', password: 'user123' },
      premium: { email: 'premium@minglefinder.com', password: 'premium123' },
      admin: { email: 'admin@minglefinder.com', password: 'admin123' }
    }
    setEmail(credentials[type].email)
    setPassword(credentials[type].password)
    toast.success(`Demo ${type} credentials filled!`)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      // Custom authentication logic
      // In a real app, this would call your authentication API
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

      const user = mockUsers[email as keyof typeof mockUsers]

      if (!user || user.password !== password) {
        setError('Invalid email or password')
        return
      }

      console.log('Login successful for user:', user.email, 'isAdmin:', user.isAdmin)

      // Store user in localStorage (in a real app, you'd use secure tokens)
      const userSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        subscriptionType: user.subscriptionType,
        isVerified: user.isVerified
      }

      localStorage.setItem('user', JSON.stringify(userSession))

      toast.success(`Welcome back, ${user.name}!`)

      // Redirect admin users to admin dashboard, others to app
      const redirectUrl = user.isAdmin ? '/admin' : callbackUrl
      console.log('Redirecting to:', redirectUrl, 'for user:', user.email, 'isAdmin:', user.isAdmin)

      // Use a small delay to ensure localStorage is set
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 100)
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof Error && error.message.includes('<!DOCTYPE')) {
        setError('Server error occurred. Please try again later.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-pink-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Mingle Finder</h1>
          </div>
          <p className="text-gray-600">Welcome back! Sign in to your account</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Demo Credentials */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">Demo Accounts:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('user')}
                  className="text-xs"
                >
                  Free User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('premium')}
                  className="text-xs"
                >
                  Premium User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('admin')}
                  className="text-xs"
                >
                  Admin
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
          
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm space-y-2">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-pink-600 hover:text-pink-700 font-medium hover:underline">
                  Create account
                </Link>
              </p>
              <p>
                <Link href="/forgot-password" className="text-gray-500 hover:text-gray-700 hover:underline">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
} 
