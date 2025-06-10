'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'

const AuthDebug = () => {
  const { user, isLoading } = useAuth()
  const [showDetails, setShowDetails] = useState(false)

  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  const status = isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated'

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg bg-gray-800 p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Auth Status: {status}</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="ml-2 rounded bg-gray-700 px-2 py-1 text-xs"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {showDetails && (
        <div className="mt-2 overflow-auto text-xs">
          <pre className="max-h-40">
            {JSON.stringify({ user, isLoading, status }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export { AuthDebug }