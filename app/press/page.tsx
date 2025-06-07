"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Newspaper, Camera, FileText } from "lucide-react"

export default function PressPage() {
  const pressReleases = [
    {
      date: "March 15, 2024",
      title: "Mingle Finder Reaches 2 Million Active Users Milestone",
      description: "The dating app celebrates exponential growth and success in creating meaningful relationships.",
      link: "#"
    },
    {
      date: "February 28, 2024",
      title: "New AI-Powered Features Launch on Mingle Finder",
      description: "Revolutionary matching algorithm update improves compatibility scores by 40%.",
      link: "#"
    },
    {
      date: "January 10, 2024",
      title: "Mingle Finder Expands to 10 New Countries",
      description: "Global expansion brings the popular dating app to millions of new potential users.",
      link: "#"
    }
  ]

  const mediaFeatures = [
    {
      source: "TechCrunch",
      title: "Mingle Finder: The Dating App That's Changing How We Find Love",
      date: "March 2024",
      image: "/media/techcrunch.jpg",
      link: "#"
    },
    {
      source: "Forbes",
      title: "Top 10 Dating Apps of 2024: Why Mingle Finder Stands Out",
      date: "February 2024",
      image: "/media/forbes.jpg",
      link: "#"
    },
    {
      source: "The Verge",
      title: "Inside Mingle Finder's AI-Powered Matching System",
      date: "January 2024",
      image: "/media/verge.jpg",
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Press Room</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Latest News and
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Media Coverage
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the latest updates, press releases, and media resources about Mingle Finder.
          </p>
        </div>

        {/* Press Contact */}
        <Card className="mb-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Press Contact</h2>
              <p className="mb-4">For media inquiries, please contact:</p>
              <p className="font-semibold">
                Sarah Johnson<br />
                Head of Communications<br />
                press@minglefinder.com<br />
                +1 (555) 123-4567
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Press Releases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Press Releases</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pressReleases.map((release, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-500 mb-2">{release.date}</div>
                  <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
                  <p className="text-gray-600 mb-4">{release.description}</p>
                  <Button variant="link" className="p-0 h-auto text-pink-600 hover:text-pink-700">
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Media Coverage */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Media Coverage</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {mediaFeatures.map((feature, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gray-100"></div>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-500 mb-2">{feature.source} • {feature.date}</div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <Button variant="link" className="p-0 h-auto text-pink-600 hover:text-pink-700">
                    Read Article →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Press Kit */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Press Kit</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                title: "Fact Sheet",
                description: "Company overview, statistics, and key information",
                buttonText: "Download PDF"
              },
              {
                icon: Camera,
                title: "Photo Pack",
                description: "High-resolution logos and product screenshots",
                buttonText: "Download ZIP"
              },
              {
                icon: Newspaper,
                title: "Brand Guidelines",
                description: "Logo usage, color palette, and typography",
                buttonText: "View Guide"
              },
              {
                icon: Download,
                title: "Full Press Kit",
                description: "Complete media package with all resources",
                buttonText: "Download All"
              }
            ].map((resource, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <resource.icon className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {resource.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 