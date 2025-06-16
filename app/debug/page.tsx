export default function DebugPage() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? 'SET' : 'NOT SET',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Environment Debug</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
        <div className="space-y-2">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-mono text-sm">{key}:</span>
              <span className={`text-sm ${value === 'SET' ? 'text-green-600' : value === 'NOT SET' ? 'text-red-600' : 'text-blue-600'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">App Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>App Running:</span>
            <span className="text-green-600">✅ YES</span>
          </div>
          <div className="flex justify-between">
            <span>Build Time:</span>
            <span className="text-blue-600">{new Date().toISOString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
