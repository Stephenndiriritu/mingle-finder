"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, User, Settings, Crown, Menu, X, Bell, Shield } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { NotificationPopover } from "@/components/notification-popover"

export function AppNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Discover", href: "/app", icon: Heart },
    { name: "Matches", href: "/app/matches", icon: MessageCircle },
    { name: "Messages", href: "/app/messages", icon: MessageCircle },
    { name: "Profile", href: "/app/profile", icon: User },
  ]

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-xl font-bold text-gray-900">Mingle Finder</span>
            </div>

            <div className="flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-pink-600 bg-pink-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center space-x-4">
              <NotificationPopover />

              {user?.subscription_type !== "free" && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  {user?.subscription_type}
                </Badge>
              )}

              {user?.is_admin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              <div className="flex items-center space-x-2">
                <Link href="/app/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="text-lg font-bold text-gray-900">Mingle Finder</span>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {isMobileMenuOpen && (
            <div className="pb-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href) ? "text-pink-600 bg-pink-50" : "text-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="border-t pt-2 mt-2">
                <Link
                  href="/app/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
                {user?.is_admin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 w-full text-left"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  isActive(item.href) ? "text-pink-600" : "text-gray-400"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16" />
    </>
  )
}
