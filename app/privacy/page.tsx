"use client"

import { Badge } from "@/components/ui/badge"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Privacy Policy</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Privacy Matters
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We are committed to protecting your personal information and ensuring your experience on Mingle Finder is safe and secure.
          </p>
        </div>

        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name, email address, and other contact information</li>
              <li>Profile information and photos</li>
              <li>Communication preferences</li>
              <li>Payment information</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Match you with potential partners</li>
              <li>Process your payments</li>
              <li>Send you updates and marketing communications</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul>
              <li>Other users (as part of your profile)</li>
              <li>Service providers and partners</li>
              <li>Law enforcement (when required by law)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>4. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Update or correct your information</li>
              <li>Delete your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Control your privacy settings</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments</li>
              <li>Employee training on data protection</li>
              <li>Access controls and authentication</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>6. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>7. Children's Privacy</h2>
            <p>
              Our services are not intended for users under 18 years of age. We do not knowingly collect information from children.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any significant changes through our platform or via email.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our practices, please contact us at:
            </p>
            <p className="mt-4">
              Email: privacy@minglefinder.com<br />
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