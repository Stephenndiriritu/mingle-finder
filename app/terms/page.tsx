"use client"

import { Badge } from "@/components/ui/badge"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>
      <div className="max-w-3xl mx-auto prose">
        <section className="mb-8">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Mingle Finder, you agree to be bound by these Terms of Service.
          </p>
        </section>

        <section className="mb-8">
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2>3. Account Registration</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and truthful information</li>
            <li>Maintain and update your information</li>
            <li>Keep your login credentials secure</li>
            <li>Notify us of any unauthorized use</li>
          </ul>
        </section>

        <section className="mb-8">
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
        </section>

        <section className="mb-8">
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
        </section>

        <section className="mb-8">
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
        </section>

        <section className="mb-8">
          <h2>7. Privacy</h2>
          <p>
            Your use of Mingle Finder is also governed by our Privacy Policy. By using our services, you consent to our collection and use of data as described in the Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
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
        </section>

        <section className="mb-8">
          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Mingle Finder shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
          </p>
        </section>

        <section className="mb-8">
          <h2>10. Changes to Terms</h2>
          <p>
            We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
          <p className="mt-4">
            Contact: legal@minglefinder.com<br />
            Address: 123 Dating Street, Love City, LC 12345
          </p>
        </section>

        <div className="text-center text-sm text-gray-600 mt-8">
          Last updated: March 2024
        </div>
      </div>
    </div>
  )
} 