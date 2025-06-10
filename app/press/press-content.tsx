"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Newspaper, Camera, FileText } from "lucide-react"
import { formatDate } from '@/lib/utils'

interface PressRelease {
  id: number
  title: string
  excerpt: string
  publish_date: string
}

interface PressContentProps {
  releases: PressRelease[]
}

export function PressContent({ releases }: PressContentProps) {
  return (
    <>
      <section>
        <h2 className="text-2xl font-semibold mb-6">Press Releases</h2>
        <div className="space-y-6">
          {releases.map((release) => (
            <PressRelease
              key={release.id}
              date={formatDate(release.publish_date)}
              title={release.title}
              excerpt={release.excerpt}
            />
          ))}
        </div>
      </section>

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
    </>
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