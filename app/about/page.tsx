"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Globe, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">About Mingle Finder</h1>
      <div className="max-w-3xl mx-auto space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600">
            At Mingle Finder, we believe everyone deserves to find meaningful connections. 
            Our mission is to create a safe, inclusive platform where people can discover 
            genuine relationships based on shared interests and values.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-600">
            Founded in 2023, Mingle Finder was born from a simple idea: dating should be 
            more than just swiping. We've built a community where authentic connections 
            flourish through meaningful conversations and shared experiences.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ValueCard
              title="Safety First"
              description="We prioritize user safety with robust verification and monitoring systems."
            />
            <ValueCard
              title="Inclusivity"
              description="We welcome people of all backgrounds, creating a diverse and accepting community."
            />
            <ValueCard
              title="Authenticity"
              description="We encourage genuine connections based on real personalities and interests."
            />
            <ValueCard
              title="Innovation"
              description="We constantly improve our platform with cutting-edge technology."
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <TeamMember
              name="Alex Johnson"
              role="CEO & Founder"
              image="/team/alex.jpg"
            />
            <TeamMember
              name="Sarah Chen"
              role="Head of Product"
              image="/team/sarah.jpg"
            />
            <TeamMember
              name="Marcus Rodriguez"
              role="Head of Technology"
              image="/team/marcus.jpg"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TeamMember({ name, role, image }: { name: string; role: string; image: string }) {
  return (
    <div className="text-center">
      <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4">
        {/* Add image component */}
      </div>
      <h3 className="font-semibold">{name}</h3>
      <p className="text-gray-500">{role}</p>
    </div>
  )
} 