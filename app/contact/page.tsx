"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // TODO: Implement contact form submission
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      setSubmitStatus("success")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Contact Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or concerns? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Mail,
                title: "Email Us",
                description: "support@minglefinder.com",
                link: "mailto:support@minglefinder.com",
              },
              {
                icon: Phone,
                title: "Call Us",
                description: "+1 (555) 123-4567",
                link: "tel:+15551234567",
              },
              {
                icon: MapPin,
                title: "Visit Us",
                description: "123 Dating Street, Love City, LC 12345",
                link: "https://maps.google.com",
              },
            ].map((contact, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <contact.icon className="h-8 w-8 mx-auto text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{contact.title}</h3>
                  <a
                    href={contact.link}
                    className="text-gray-600 hover:text-pink-500 transition-colors"
                  >
                    {contact.description}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Your message"
                    className="min-h-[150px]"
                    required
                  />
                </div>

                {submitStatus === "success" && (
                  <p className="text-green-600 bg-green-50 p-3 rounded-md">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                )}

                {submitStatus === "error" && (
                  <p className="text-red-600 bg-red-50 p-3 rounded-md">
                    Something went wrong. Please try again later.
                  </p>
                )}

                <div className="mt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {[
                    {
                      q: "How do I reset my password?",
                      a: "You can reset your password by clicking the 'Forgot Password' link on the login page.",
                    },
                    {
                      q: "How do I cancel my subscription?",
                      a: "Go to Settings > Subscription and click 'Cancel Subscription'.",
                    },
                    {
                      q: "Is my data secure?",
                      a: "Yes, we use industry-standard encryption to protect your data.",
                    },
                    {
                      q: "How do I report a user?",
                      a: "Click the three dots menu on any profile or message and select 'Report'.",
                    },
                  ].map((faq, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold mb-2">{faq.q}</h3>
                      <p className="text-gray-600">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Our Support Hours</h2>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="mb-2">Monday - Friday: 9:00 AM - 8:00 PM EST</p>
                  <p className="mb-2">Saturday: 10:00 AM - 6:00 PM EST</p>
                  <p>Sunday: 12:00 PM - 5:00 PM EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 