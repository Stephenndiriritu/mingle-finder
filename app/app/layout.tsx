import type React from "react"
import { AppNavigation } from "@/components/app-navigation"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      <main className="pb-16 md:pb-0">{children}</main>
    </div>
  )
}

