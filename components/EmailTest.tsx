'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  sendEmail, 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendMatchNotificationEmail,
  sendMessageNotificationEmail,
  isEmailJSConfigured 
} from '@/lib/email'

export function EmailTest() {
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Test Email from Mingle Finder')
  const [message, setMessage] = useState('<h1>Hello!</h1><p>EmailJS is working correctly!</p>')
  const [loading, setLoading] = useState(false)

  const isConfigured = isEmailJSConfigured()

  const testGeneralEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      await sendEmail(email, subject, message)
      toast.success('General email sent successfully!')
    } catch (error) {
      toast.error('Failed to send email: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const testVerificationEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      await sendVerificationEmail(email, 'test-token-123')
      toast.success('Verification email sent successfully!')
    } catch (error) {
      toast.error('Failed to send verification email: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const testWelcomeEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      await sendWelcomeEmail(email, 'Test User')
      toast.success('Welcome email sent successfully!')
    } catch (error) {
      toast.error('Failed to send welcome email: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const testMatchEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      await sendMatchNotificationEmail(email, 'Sarah Johnson')
      toast.success('Match notification email sent successfully!')
    } catch (error) {
      toast.error('Failed to send match email: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const testMessageEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      await sendMessageNotificationEmail(email, 'John Doe', 'Hey! How are you doing today?')
      toast.success('Message notification email sent successfully!')
    } catch (error) {
      toast.error('Failed to send message email: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>📧 EmailJS Test Panel</CardTitle>
        <CardDescription>
          Test the EmailJS integration for Mingle Finder
        </CardDescription>
        
        {!isConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ EmailJS is not configured. Please set up your environment variables first.
              <br />
              See <code>EMAILJS_SETUP_GUIDE.md</code> for instructions.
            </p>
          </div>
        )}
        
        {isConfigured && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-sm">
              ✅ EmailJS is configured and ready to send emails!
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Test Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* General Email Test */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold">General Email Test</h3>
          
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message (HTML)
            </label>
            <Textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={testGeneralEmail} 
            disabled={loading || !isConfigured}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send General Email'}
          </Button>
        </div>

        {/* Predefined Email Tests */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="font-semibold">Predefined Email Templates</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={testVerificationEmail} 
              disabled={loading || !isConfigured}
              variant="outline"
            >
              📧 Verification Email
            </Button>
            
            <Button 
              onClick={testWelcomeEmail} 
              disabled={loading || !isConfigured}
              variant="outline"
            >
              👋 Welcome Email
            </Button>
            
            <Button 
              onClick={testMatchEmail} 
              disabled={loading || !isConfigured}
              variant="outline"
            >
              💕 Match Notification
            </Button>
            
            <Button 
              onClick={testMessageEmail} 
              disabled={loading || !isConfigured}
              variant="outline"
            >
              💬 Message Notification
            </Button>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Service ID:</strong> {process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'Not configured'}</p>
          <p><strong>Public Key:</strong> {process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? 'Configured' : 'Not configured'}</p>
          <p><strong>General Template:</strong> {process.env.NEXT_PUBLIC_EMAILJS_GENERAL_TEMPLATE_ID || 'Not configured'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
