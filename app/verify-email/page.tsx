import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: { token: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  if (!searchParams.token) {
    redirect("/app")
  }

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify-email`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: searchParams.token })
    })

    if (!response.ok) {
      throw new Error("Failed to verify email")
    }

    redirect("/app?verified=true")
  } catch (error) {
    redirect("/app?verificationError=true")
  }
} 