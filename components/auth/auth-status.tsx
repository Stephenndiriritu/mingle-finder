'use client'

import { useAuth } from "@/components/auth-provider"

export default function AuthStatus() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Not signed in</div>
  }

  return <div>Signed in as {user.email}</div>
}