"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, MessageSquare, UserX, Camera, Flag, ThumbsUp, AlertTriangle } from "lucide-react"

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Community Guidelines</h1>
      <div className="max-w-3xl mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ValueCard
              icon="🤝"
              title="Respect"
              description="Treat everyone with kindness and respect, regardless of their background."
            />
            <ValueCard
              icon="🔒"
              title="Safety"
              description="Help keep our community safe by reporting suspicious behavior."
            />
            <ValueCard
              icon="💫"
              title="Authenticity"
              description="Be yourself and use recent, unfiltered photos."
            />
            <ValueCard
              icon="💭"
              title="Communication"
              description="Engage in meaningful conversations and respond to messages."
            />
          </div>
        </section>

        <section className="space-y-6">
          <GuidelineSection
            title="Profile Guidelines"
            rules={[
              "Use recent photos that clearly show your face",
              "No inappropriate or explicit content",
              "No commercial or promotional content",
              "No fake or impersonated profiles"
            ]}
          />
          <GuidelineSection
            title="Messaging Guidelines"
            rules={[
              "No harassment or hate speech",
              "No spam or solicitation",
              "No sharing of personal contact info before matching",
              "Report inappropriate messages"
            ]}
          />
          <GuidelineSection
            title="Meeting Guidelines"
            rules={[
              "Meet in public places",
              "Tell friends about your plans",
              "Stay sober and alert",
              "Trust your instincts"
            ]}
          />
        </section>
      </div>
    </div>
  )
}

function ValueCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="p-6 border rounded-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function GuidelineSection({ 
  title, 
  rules 
}: { 
  title: string
  rules: string[]
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start">
            <span className="text-pink-500 mr-2">•</span>
            <span className="text-gray-700">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  )
} 