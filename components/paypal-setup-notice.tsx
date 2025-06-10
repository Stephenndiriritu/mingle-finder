'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function PayPalSetupNotice() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const envTemplate = `# PayPal Sandbox Credentials
PAYPAL_CLIENT_ID=your_actual_client_id_here
PAYPAL_CLIENT_SECRET=your_actual_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_actual_client_id_here
PAYPAL_MODE=sandbox`

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          PayPal Integration Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-orange-700">
          To enable PayPal payments, you need to set up your PayPal sandbox credentials. 
          Follow these steps to get started:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-800">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Create PayPal Developer Account</p>
              <p className="text-xs text-orange-600 mt-1">
                Go to PayPal Developer and log in with your PayPal account
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-7 text-xs"
                onClick={() => window.open('https://developer.paypal.com/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open PayPal Developer
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-800">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Create Sandbox App</p>
              <p className="text-xs text-orange-600 mt-1">
                Navigate to "My Apps & Credentials" → Sandbox → "Create App"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-800">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Copy Credentials</p>
              <p className="text-xs text-orange-600 mt-1">
                Copy the Client ID and Client Secret from your app
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-800">
              4
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Update Environment Variables</p>
              <p className="text-xs text-orange-600 mt-1">
                Add your credentials to .env.local file:
              </p>
              <div className="mt-2 relative">
                <pre className="text-xs bg-gray-100 p-2 rounded border overflow-x-auto">
                  {envTemplate}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => copyToClipboard(envTemplate, 4)}
                >
                  {copiedStep === 4 ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-800">
              5
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Restart Development Server</p>
              <p className="text-xs text-orange-600 mt-1">
                Stop and restart your dev server to load the new credentials
              </p>
              <div className="mt-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">npm run dev</code>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> The PayPal integration is fully implemented and production-ready. 
            You just need to add your sandbox credentials to start testing payments!
          </p>
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/PAYPAL_SETUP.md', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Complete Setup Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
