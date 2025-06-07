"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, MessageSquare, UserX, Camera, Flag, ThumbsUp, AlertTriangle } from "lucide-react"

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Community Guidelines</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Creating a Safe and
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Respectful Community
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our community guidelines ensure that Mingle Finder remains a safe, respectful, and enjoyable place for everyone.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Respect and Kindness */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 text-pink-500 mr-2" />
                <h2 className="text-2xl font-bold">Respect and Kindness</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  Treat all members with respect, regardless of their race, religion, gender, sexual orientation, or background.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>No hate speech or discriminatory language</li>
                  <li>No harassment or bullying</li>
                  <li>Be respectful of others' boundaries</li>
                  <li>Use appropriate language and tone</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Camera className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-2xl font-bold">Profile Content</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  Your profile should be authentic and appropriate for our diverse community.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use recent and clear photos of yourself</li>
                  <li>No explicit or inappropriate content</li>
                  <li>No misleading or fake information</li>
                  <li>No commercial content or advertising</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-2xl font-bold">Communication</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  Keep your conversations respectful and appropriate.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>No spam or unsolicited messages</li>
                  <li>No harassment or threatening messages</li>
                  <li>No solicitation or commercial messages</li>
                  <li>No sharing of personal contact information in public</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Safety and Security */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-500 mr-2" />
                <h2 className="text-2xl font-bold">Safety and Security</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  Help us maintain a secure environment for all users.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>No sharing of private information</li>
                  <li>No soliciting of personal financial information</li>
                  <li>Report suspicious behavior</li>
                  <li>No creation of multiple accounts</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Reporting Violations */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Flag className="h-6 w-6 text-red-500 mr-2" />
                <h2 className="text-2xl font-bold">Reporting Violations</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  If you see something that violates our guidelines:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the report button on profiles or messages</li>
                  <li>Provide specific details about the violation</li>
                  <li>Block users who make you uncomfortable</li>
                  <li>Contact support for serious concerns</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Consequences */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <UserX className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-2xl font-bold">Consequences</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  Violations of our community guidelines may result in:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Warnings</li>
                  <li>Temporary account suspension</li>
                  <li>Permanent account termination</li>
                  <li>Legal action in serious cases</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Updates and Changes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <ThumbsUp className="h-6 w-6 text-teal-500 mr-2" />
                <h2 className="text-2xl font-bold">Updates and Changes</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  These guidelines may be updated periodically. Users will be notified of significant changes.
                </p>
                <div className="bg-yellow-50 p-4 rounded-md mt-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    By using Mingle Finder, you agree to follow these community guidelines. Failure to comply may result in account restrictions or termination.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 