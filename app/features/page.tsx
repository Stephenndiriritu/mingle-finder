"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Heart,
  MessageCircle,
  Shield,
  Users,
  Star,
  Zap,
  Bell,
  Search,
  Gift,
  Camera,
  Map,
  Crown
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: Heart,
      title: "Smart Matching Algorithm",
      description: "Our advanced AI-powered matching system learns from your preferences and behaviors to suggest the most compatible matches. The more you use the app, the better your matches become.",
      color: "text-red-500",
    },
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Enjoy seamless conversations with your matches through our secure, real-time messaging system. Share text, photos, and emojis, with read receipts and typing indicators.",
      color: "text-blue-500",
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Your safety is our priority. We use state-of-the-art encryption, photo verification, and AI-powered moderation to ensure a safe dating environment.",
      color: "text-green-500",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay updated with intelligent notifications about new matches, messages, and profile visitors. Our system prioritizes notifications based on your engagement patterns.",
      color: "text-yellow-500",
    },
    {
      icon: Search,
      title: "Advanced Filters",
      description: "Find exactly who you're looking for with our comprehensive search filters. Filter by interests, location, age, and more to find your perfect match.",
      color: "text-purple-500",
    },
    {
      icon: Gift,
      title: "Virtual Gifts",
      description: "Show interest and break the ice by sending virtual gifts. Choose from a wide selection of cute and meaningful digital presents.",
      color: "text-pink-500",
    },
    {
      icon: Camera,
      title: "Photo Verification",
      description: "Build trust with verified photos. Our AI-powered verification system ensures all users are genuine and their photos are recent.",
      color: "text-indigo-500",
    },
    {
      icon: Map,
      title: "Location-based Matching",
      description: "Meet people nearby or expand your search worldwide. Our location-based matching helps you find love wherever you are.",
      color: "text-teal-500",
    },
    {
      icon: Users,
      title: "Group Events",
      description: "Join local singles events and meetups organized through the app. A safe and fun way to meet multiple potential matches in person.",
      color: "text-orange-500",
    },
    {
      icon: Crown,
      title: "Premium Benefits",
      description: "Unlock advanced features with our premium subscription. Enjoy unlimited likes, see who likes you, boost your profile, and more.",
      color: "text-amber-500",
    },
    {
      icon: Star,
      title: "Profile Highlights",
      description: "Make your profile stand out with customizable highlights. Showcase your personality with featured photos, interests, and stories.",
      color: "text-lime-500",
    },
    {
      icon: Zap,
      title: "Instant Connections",
      description: "Get notified instantly when someone likes you back. Start conversations immediately and don't miss any potential connections.",
      color: "text-cyan-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Find True Love
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover all the powerful features that make Mingle Finder the best dating app for finding meaningful connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 