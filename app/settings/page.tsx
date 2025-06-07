import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SettingsClient from "./settings-client"

export const metadata: Metadata = {
  title: "Settings | Mingle Finder",
  description: "Manage your account settings and preferences",
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return <SettingsClient />
}