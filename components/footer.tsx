"use client"

import Link from "next/link"
import { Heart, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthModal } from "@/components/auth-modal"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("register")

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/minglefinder", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/minglefinder", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/minglefinder", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/minglefinder", label: "LinkedIn" }
  ]

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-pink-500" />
              <Link href="/" className="text-xl font-bold hover:text-pink-500 transition-colors">
                Mingle Finder
              </Link>
            </div>
            <p className="text-gray-400 mb-6">
              The ultimate dating app for meaningful connections and lasting relationships.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/premium" className="hover:text-white transition-colors">
                  Premium
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-white transition-colors">
                  Safety
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/success-stories')}
                  className="hover:text-white transition-colors"
                >
                  Success Stories
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => openAuth("register")}
                  className="hover:text-white transition-colors"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Mingle Finder. All rights reserved. Made with ❤️ for finding love.</p>
        </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </footer>
  )
} 
