"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AuthModal } from "@/components/auth-modal"

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("register")

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <header className="bg-white border-b py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Mingle Finder
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="text-gray-600 hover:text-pink-500 transition-colors">
              Features
            </Link>
            <Link href="/premium" className="text-gray-600 hover:text-pink-500 transition-colors">
              Premium
            </Link>
            <Link href="/success-stories" className="text-gray-600 hover:text-pink-500 transition-colors">
              Success Stories
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-pink-500 transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => openAuth("login")} className="text-gray-600 hover:text-pink-600">
              Sign In
            </Button>
            <Button
              onClick={() => openAuth("register")}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </header>
  )
} 