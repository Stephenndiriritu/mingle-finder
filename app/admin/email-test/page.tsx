'use client'

import { EmailTest } from '@/components/EmailTest'

export default function EmailTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📧 EmailJS Integration Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the EmailJS integration for Mingle Finder. This page allows you to send test emails 
            to verify that your EmailJS configuration is working correctly.
          </p>
        </div>

        <EmailTest />

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Setup Instructions
          </h2>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>1. Create an account at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">EmailJS.com</a></p>
            <p>2. Set up an email service (Gmail, Outlook, etc.)</p>
            <p>3. Create email templates in the EmailJS dashboard</p>
            <p>4. Add your EmailJS credentials to environment variables</p>
            <p>5. Test the integration using this page</p>
          </div>
          
          <div className="mt-4">
            <p className="text-blue-800 text-sm">
              📖 For detailed setup instructions, see <code className="bg-blue-100 px-2 py-1 rounded">EMAILJS_SETUP_GUIDE.md</code>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            🔧 Environment Variables Required
          </h2>
          <div className="text-gray-700 text-sm space-y-1 font-mono">
            <p>NEXT_PUBLIC_EMAILJS_SERVICE_ID</p>
            <p>NEXT_PUBLIC_EMAILJS_PUBLIC_KEY</p>
            <p>NEXT_PUBLIC_EMAILJS_GENERAL_TEMPLATE_ID</p>
            <p>NEXT_PUBLIC_EMAILJS_VERIFICATION_TEMPLATE_ID</p>
            <p>NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID</p>
            <p>NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID</p>
            <p>NEXT_PUBLIC_EMAILJS_MATCH_TEMPLATE_ID</p>
            <p>NEXT_PUBLIC_EMAILJS_MESSAGE_TEMPLATE_ID</p>
          </div>
        </div>
      </div>
    </div>
  )
}
