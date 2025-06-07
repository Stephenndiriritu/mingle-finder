"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Globe, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">About Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Connecting Hearts, Creating
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Lasting Relationships
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            At Mingle Finder, we believe that everyone deserves to find their perfect match. Our mission is to create meaningful connections that last a lifetime.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
          {[
            { number: "2M+", label: "Active Users", icon: Users },
            { number: "50+", label: "Countries", icon: Globe },
            { number: "500K+", label: "Matches Made", icon: Heart },
            { number: "10+", label: "Years Experience", icon: Award },
          ].map((stat, index) => (
            <Card key={index} className="text-center p-6">
              <CardContent className="p-0">
                <stat.icon className="h-8 w-8 mx-auto mb-4 text-pink-500" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg text-gray-600">
            <p>
              Founded in 2014, Mingle Finder started with a simple idea: to create a dating platform that focuses on genuine connections rather than superficial matches. Our team of relationship experts and tech innovators worked together to develop an algorithm that considers compatibility on multiple levels - from basic preferences to deep personality traits.
            </p>
            <p className="mt-4">
              Over the years, we've grown from a small startup to one of the most trusted names in online dating. Our success is measured not just in numbers, but in the countless relationships, marriages, and families that have formed through our platform.
            </p>
            <p className="mt-4">
              Today, we continue to innovate and improve our services, always keeping our core mission in mind: helping people find meaningful, lasting relationships.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Safety First",
                description: "We prioritize user safety with advanced verification systems and strict community guidelines.",
              },
              {
                title: "Genuine Connections",
                description: "Our matching algorithm focuses on compatibility and shared values for meaningful relationships.",
              },
              {
                title: "Inclusive Community",
                description: "We celebrate diversity and create a welcoming space for everyone to find love.",
              },
            ].map((value, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The passionate people behind Mingle Finder who work tirelessly to help you find love.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Sarah Johnson",
              role: "CEO & Founder",
              image: "/team/sarah.jpg",
            },
            {
              name: "Michael Chen",
              role: "Chief Technology Officer",
              image: "/team/michael.jpg",
            },
            {
              name: "Emily Rodriguez",
              role: "Head of User Experience",
              image: "/team/emily.jpg",
            },
            {
              name: "David Kim",
              role: "Head of Security",
              image: "/team/david.jpg",
            },
          ].map((member, index) => (
            <Card key={index} className="text-center overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join millions of happy couples who found their soulmate on Mingle Finder.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  )
} 