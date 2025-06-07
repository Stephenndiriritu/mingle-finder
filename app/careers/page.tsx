"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Code, Lightbulb, Users, Rocket, Coffee } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function CareersPage() {
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    resume: "",
    coverLetter: ""
  })

  const positions = [
    {
      department: "Engineering",
      roles: [
        {
          title: "Senior Full Stack Developer",
          location: "Remote",
          type: "Full-time",
          description: "Build and maintain our core dating platform using Next.js, React, and Node.js."
        },
        {
          title: "Mobile Developer (iOS)",
          location: "San Francisco, CA",
          type: "Full-time",
          description: "Develop and enhance our iOS app using Swift and SwiftUI."
        },
        {
          title: "Machine Learning Engineer",
          location: "Remote",
          type: "Full-time",
          description: "Improve our matching algorithm and recommendation systems."
        }
      ]
    },
    {
      department: "Product & Design",
      roles: [
        {
          title: "Product Manager",
          location: "New York, NY",
          type: "Full-time",
          description: "Lead product strategy and development for our premium features."
        },
        {
          title: "UI/UX Designer",
          location: "Remote",
          type: "Full-time",
          description: "Create beautiful and intuitive user experiences for our platform."
        }
      ]
    },
    {
      department: "Marketing & Growth",
      roles: [
        {
          title: "Growth Marketing Manager",
          location: "Los Angeles, CA",
          type: "Full-time",
          description: "Drive user acquisition and retention through data-driven marketing strategies."
        },
        {
          title: "Content Marketing Specialist",
          location: "Remote",
          type: "Full-time",
          description: "Create engaging content for our blog, social media, and email campaigns."
        }
      ]
    }
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness programs."
    },
    {
      icon: Coffee,
      title: "Work-Life Balance",
      description: "Flexible working hours, unlimited PTO, and remote work options."
    },
    {
      icon: Rocket,
      title: "Growth & Development",
      description: "Learning budget, conference attendance, and career development opportunities."
    },
    {
      icon: Users,
      title: "Team Building",
      description: "Regular team events, retreats, and social activities to foster connections."
    }
  ]

  const values = [
    {
      icon: Heart,
      title: "User-First",
      description: "We put our users' happiness and success at the center of everything we do."
    },
    {
      icon: Code,
      title: "Innovation",
      description: "We embrace new technologies and ideas to create the best dating experience."
    },
    {
      icon: Lightbulb,
      title: "Creativity",
      description: "We encourage creative thinking and unique solutions to complex problems."
    },
    {
      icon: Users,
      title: "Diversity",
      description: "We celebrate differences and create an inclusive environment for all."
    }
  ]

  const handleApply = (position: string) => {
    setSelectedPosition(position)
    setShowApplyModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...applicationForm,
          position: selectedPosition
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit application")
      }

      setShowApplyModal(false)
      setApplicationForm({ name: "", email: "", resume: "", coverLetter: "" })
      alert("Application submitted successfully! We'll be in touch soon.")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Join Our Team</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Help People Find
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Their Perfect Match
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our mission to create meaningful connections and make dating better for everyone.
          </p>
        </div>

        {/* Company Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <value.icon className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits & Perks</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <benefit.icon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          <div className="space-y-8">
            {positions.map((department, index) => (
              <div key={index}>
                <h3 className="text-2xl font-semibold mb-6">{department.department}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {department.roles.map((role, roleIndex) => (
                    <Card key={roleIndex} className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <h4 className="text-xl font-semibold mb-2">{role.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span>{role.location}</span>
                          <span>•</span>
                          <span>{role.type}</span>
                        </div>
                        <p className="text-gray-600 mb-6">{role.description}</p>
                        <Button onClick={() => handleApply(role.title)}>Apply Now</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Modal */}
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Apply for {selectedPosition}</DialogTitle>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={applicationForm.name}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume URL</Label>
                <Input
                  id="resume"
                  type="url"
                  value={applicationForm.resume}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, resume: e.target.value }))}
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                  placeholder="Tell us why you're interested in this position..."
                  className="h-32"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner className="mr-2" /> : null}
                  Submit Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 