import { redirect } from "next/navigation"
import pool from "@/lib/db"

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ token: string }>
}) {
  const params = await searchParams
  if (!params.token) {
    redirect("/app")
  }

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify-email`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.token })
    })

    if (!response.ok) {
      throw new Error("Failed to verify email")
    }

    redirect("/app?verified=true")
  } catch (error) {
    redirect("/app?verificationError=true")
  }
} 