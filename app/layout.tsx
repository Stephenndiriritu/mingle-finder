import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProvidersWrapper } from "@/components/providers-wrapper"
import { metadata } from "./metadata"
import { viewport } from "./viewport"
import { validateEnv } from "@/lib/env"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider } from "@/components/auth-provider"
import dynamic from 'next/dynamic'

// Validate environment variables
validateEnv()

const inter = Inter({ subsets: ["latin"] })

// Dynamically import AuthDebug only in development
const AuthDebug = process.env.NODE_ENV === 'development' 
  ? dynamic(() => import('@/components/auth-debug').then(mod => mod.AuthDebug))
  : () => null

export { metadata, viewport }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('mingle-theme')

                if (theme === '"dark"') {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <ProvidersWrapper>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <AuthDebug />
              </div>
            </AuthProvider>
          </ProvidersWrapper>
        </ErrorBoundary>
      </body>
    </html>
  )
}



