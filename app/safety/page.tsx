"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, AlertTriangle, Lock, UserCheck, Bell, Eye, MessageSquare, Heart } from "lucide-react"

export default function SafetyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Safety First</h1>
      <div className="max-w-3xl mx-auto space-y-8">
        <SafetySection
          title="Profile Verification"
          description="We use advanced verification techniques to ensure users are who they say they are. This includes photo verification and optional ID verification."
          tips={[
            "Upload clear, recent photos",
            "Complete the verification process",
            "Report suspicious profiles"
          ]}
        />
        
        <SafetySection
          title="Safe Messaging"
          description="Our messaging system is designed with your safety in mind. Messages are monitored for inappropriate content and personal information is protected."
          tips={[
            "Don't share personal contact info",
            "Use our built-in video chat",
            "Block and report harassment"
          ]}
        />
        
        <SafetySection
          title="Meeting in Person"
          description="When you're ready to meet someone in person, follow these safety guidelines to ensure a safe and enjoyable experience."
          tips={[
            "Meet in public places",
            "Tell friends about your plans",
            "Use your own transportation",
            "Trust your instincts"
          ]}
        />
        
        <SafetySection
          title="Privacy Protection"
          description="Your privacy is our priority. We use industry-standard encryption and never share your personal information without consent."
          tips={[
            "Use privacy settings",
            "Control who sees your profile",
            "Manage your data preferences"
          ]}
        />
              </div>
            </div>
  )
}

function SafetySection({ 
  title, 
  description, 
  tips 
}: { 
  title: string
  description: string
  tips: string[]
}) {
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold mb-2">Safety Tips:</h3>
        <ul className="list-disc pl-5 space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="text-gray-700">{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  )
} 