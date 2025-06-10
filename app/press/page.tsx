import { Suspense } from 'react'
import { getPressReleases } from '@/lib/api/content'
import { PressContent } from './press-content'
import { PressReleaseSkeleton } from './press-release-skeleton'

export const revalidate = 3600 // Revalidate every hour

export default async function PressPage() {
  const releases = await getPressReleases()

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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Press & Media</h1>
      <div className="max-w-4xl mx-auto space-y-12">
        <Suspense fallback={<PressReleaseSkeleton count={3} />}>
          <PressContent releases={releases} />
        </Suspense>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Media Kit</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <DownloadCard
              title="Brand Assets"
              description="Logos, icons, and brand guidelines"
              fileType="ZIP"
              fileSize="12.5 MB"
            />
            <DownloadCard
              title="Press Photos"
              description="High-resolution product screenshots and team photos"
              fileType="ZIP"
              fileSize="25.8 MB"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Media Contact</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Press Inquiries</h3>
            <p className="text-gray-600 mb-4">For press inquiries, please contact our media relations team:</p>
            <p className="text-gray-800">press@minglefinder.com</p>
            <p className="text-gray-800">+1 (555) 123-4567</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function PressRelease({ date, title, excerpt }: { date: string; title: string; excerpt: string }) {
  return (
    <div className="border-b pb-6">
      <p className="text-gray-500 text-sm mb-2">{date}</p>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{excerpt}</p>
      <button className="text-pink-500 hover:text-pink-600 font-semibold">
        Read More →
      </button>
    </div>
  )
}

function DownloadCard({ 
  title, 
  description, 
  fileType, 
  fileSize 
}: { 
  title: string
  description: string
  fileType: string
  fileSize: string
}) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {fileType} • {fileSize}
        </span>
        <button className="text-pink-500 hover:text-pink-600 font-semibold">
          Download
        </button>
      </div>
    </div>
  )
} 