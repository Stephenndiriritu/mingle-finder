"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/testimonials", label: "Testimonials" },
]

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log('Admin layout - user:', user, 'isLoading:', isLoading, 'isAdmin:', user?.isAdmin)
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log('Redirecting non-admin user to home page. User:', user?.email, 'isAdmin:', user?.isAdmin)
      router.push("/")
    } else if (!isLoading && user?.isAdmin) {
      console.log('Admin user confirmed, showing admin dashboard for:', user.email)
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    console.log('Admin access denied in layout for user:', user)
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Admin
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium",
                        pathname === item.href
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/app"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Back to App
              </Link>
            </div>
          </div>
        </div>
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex-1 text-center",
                    pathname === item.href
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-6">{children}</main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
} 