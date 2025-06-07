"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, AlertTriangle, Lock, UserCheck, Bell, Eye, MessageSquare, Heart } from "lucide-react"

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Safety First</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Safety is Our
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Top Priority
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to creating a safe and secure environment for all our users. Follow these guidelines to ensure a safe dating experience.
          </p>
        </div>

        {/* Safety Features */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {[
            {
              icon: Shield,
              title: "Profile Verification",
              description: "All profiles are verified to ensure authenticity",
            },
            {
              icon: Lock,
              title: "Secure Messaging",
              description: "End-to-end encrypted messaging system",
            },
            {
              icon: Bell,
              title: "Safety Alerts",
              description: "Real-time alerts for suspicious activity",
            },
            {
              icon: UserCheck,
              title: "User Reporting",
              description: "Easy reporting of inappropriate behavior",
            },
          ].map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 mx-auto text-pink-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Safety Guidelines */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Safety Guidelines</h2>

          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                  Meeting in Person
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Meet in public places for the first few dates</li>
                  <li>• Tell a friend or family member about your plans</li>
                  <li>• Arrange your own transportation</li>
                  <li>• Stay sober and alert</li>
                  <li>• Trust your instincts</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Eye className="h-6 w-6 text-blue-500 mr-2" />
                  Protecting Your Privacy
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Don't share personal information too quickly</li>
                  <li>• Keep conversations within the app initially</li>
                  <li>• Be cautious with photos you share</li>
                  <li>• Don't share financial information</li>
                  <li>• Use a unique password for your account</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 text-green-500 mr-2" />
                  Communication Safety
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Be wary of users who pressure you for personal information</li>
                  <li>• Report inappropriate or harassing messages</li>
                  <li>• Block users who make you uncomfortable</li>
                  <li>• Don't send money to people you haven't met</li>
                  <li>• Be cautious of sob stories or urgent requests</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Heart className="h-6 w-6 text-red-500 mr-2" />
                  Healthy Dating Practices
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Take time to get to know someone</li>
                  <li>• Set clear boundaries and respect others' boundaries</li>
                  <li>• Be honest about your intentions</li>
                  <li>• Don't feel pressured to move faster than you're comfortable with</li>
                  <li>• Report any concerning behavior</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Resources */}
          <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Emergency Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Emergency Services</h3>
                <p className="text-gray-600">Call 911 (US) or your local emergency number</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">National Dating Abuse Helpline</h3>
                <p className="text-gray-600">1-866-331-9474</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Crisis Text Line</h3>
                <p className="text-gray-600">Text HOME to 741741</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Mingle Finder Support</h3>
                <p className="text-gray-600">safety@minglefinder.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 