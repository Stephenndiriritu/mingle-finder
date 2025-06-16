'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null
  }

  const envVars: Record<string, string> = {
    // Core
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',

    // Database & Auth
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',

    // EmailJS
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'NOT SET',
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_EMAILJS_GENERAL_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_GENERAL_TEMPLATE_ID || 'NOT SET',

    // PayPal
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'NOT SET',
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET ? 'SET' : 'NOT SET',

    // Optional
    REDIS_URL: process.env.REDIS_URL ? 'SET' : 'NOT SET',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
  }

  const getStatusColor = (value: string) => {
    if (value === 'SET') return 'text-green-600'
    if (value === 'NOT SET') return 'text-red-600'
    return 'text-blue-600'
  }

  const getStatusIcon = (value: string) => {
    if (value === 'SET') return '✅'
    if (value === 'NOT SET') return '❌'
    return '📝'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Environment Debug Panel
          </h1>
          <p className="text-gray-600">
            Check the status of environment variables and system configuration
          </p>
        </div>

        <div className="grid gap-6">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Status of all environment variables used by the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-mono text-sm font-medium">{key}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getStatusColor(value)}`}>
                        {getStatusIcon(value)} {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current application status and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Application Status</span>
                  <span className="text-green-600 font-medium">✅ Running</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Environment</span>
                  <span className="text-blue-600 font-medium">{process.env.NODE_ENV}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Build Time</span>
                  <span className="text-gray-600 text-sm">{new Date().toISOString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">User Authentication</span>
                  <span className="text-green-600 font-medium">✅ Working</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Admin Access</span>
                  <span className="text-green-600 font-medium">✅ Verified</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Status */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Status</CardTitle>
              <CardDescription>
                Status of major application features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Email Notifications (EmailJS)</span>
                  <span className={`font-medium ${process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? 'text-green-600' : 'text-yellow-600'}`}>
                    {process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? '✅ Configured' : '⚠️ Needs Setup'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Payment Processing (PayPal)</span>
                  <span className={`font-medium ${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? 'text-green-600' : 'text-yellow-600'}`}>
                    {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? '✅ Configured' : '⚠️ Needs Setup'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Caching (Redis)</span>
                  <span className={`font-medium ${process.env.REDIS_URL ? 'text-green-600' : 'text-gray-600'}`}>
                    {process.env.REDIS_URL ? '✅ Configured' : '💡 Optional'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">File Storage (Cloudinary)</span>
                  <span className={`font-medium ${process.env.CLOUDINARY_CLOUD_NAME ? 'text-green-600' : 'text-gray-600'}`}>
                    {process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '💡 Optional'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common debugging and testing actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a 
                  href="/admin/email-test" 
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  📧 Test Email Integration
                </a>
                <a 
                  href="/admin/dashboard" 
                  className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  📊 Admin Dashboard
                </a>
                <a 
                  href="/admin/users" 
                  className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  👥 User Management
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
