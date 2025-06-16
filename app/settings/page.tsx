import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import SettingsClient from "./settings-client"

export const metadata: Metadata = {
  title: "Settings | Mingle Finder",
  description: "Manage your account settings and preferences",
}

export default function SettingsPage() {
  return <SettingsClient />
}