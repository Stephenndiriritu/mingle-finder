"use client"

import { Badge } from "@/components/ui/badge"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Terms of Service</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using Mingle Finder.
          </p>
        </div>

        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Mingle Finder, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>2. Eligibility</h2>
            <p>To use Mingle Finder, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Be legally able to form a binding contract</li>
              <li>Not be prohibited from using dating services under applicable law</li>
              <li>Create only one account per person</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>3. Account Registration</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate and truthful information</li>
              <li>Maintain and update your information</li>
              <li>Keep your login credentials secure</li>
              <li>Notify us of any unauthorized use</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Harass, abuse, or harm other users</li>
              <li>Post inappropriate or offensive content</li>
              <li>Impersonate others</li>
              <li>Use the service for commercial purposes</li>
              <li>Attempt to manipulate the matching system</li>
              <li>Share or solicit personal financial information</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>5. Premium Services</h2>
            <p>
              Premium features are available through paid subscriptions. Subscriptions:
            </p>
            <ul>
              <li>Auto-renew unless cancelled</li>
              <li>Can be cancelled at any time</li>
              <li>Are non-refundable unless required by law</li>
              <li>May change in price with notice</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>6. Intellectual Property</h2>
            <p>
              All content and features of Mingle Finder are protected by copyright, trademark, and other laws. You may not:
            </p>
            <ul>
              <li>Copy or reproduce any part of the service</li>
              <li>Modify or create derivative works</li>
              <li>Use our trademarks without permission</li>
              <li>Scrape or extract data</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>7. Privacy</h2>
            <p>
              Your use of Mingle Finder is also governed by our Privacy Policy. By using our services, you consent to our collection and use of data as described in the Privacy Policy.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              Mingle Finder is provided "as is" without any warranties. We do not guarantee:
            </p>
            <ul>
              <li>You will find a match</li>
              <li>Continuous, uninterrupted service</li>
              <li>The accuracy of user information</li>
              <li>The behavior of other users</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Mingle Finder shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2>10. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
            <p className="mt-4">
              Contact: legal@minglefinder.com<br />
              Address: 123 Dating Street, Love City, LC 12345
            </p>
          </div>

          <div className="text-center text-sm text-gray-600 mt-8">
            Last updated: March 2024
          </div>
        </div>
      </div>
    </div>
  )
} 