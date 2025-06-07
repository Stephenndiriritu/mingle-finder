"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: number
  email: string
  name: string
  date_of_birth: string
  gender: string
  location: string
  is_active: boolean
  is_admin: boolean
  is_verified: boolean
  subscription_type: string
  subscription_expires_at: string
  last_active: string
  created_at: string
  profile_completion_percentage: number
  total_swipes: number
  total_matches: number
  total_messages: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [subscription, setSubscription] = useState("all")
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [search, status, subscription, pagination.page])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        status,
        subscription,
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async (userId: number, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: action === "activate" ? true : action === "deactivate" ? false : undefined,
          isVerified: action === "verify" ? true : action === "unverify" ? false : undefined,
        }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">Unauthorized access</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage users, roles, and permissions</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subscription} onValueChange={setSubscription}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {users.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={user.is_active ? "success" : "secondary"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {user.is_verified && <Badge variant="default">Verified</Badge>}
                  {user.is_admin && <Badge variant="destructive">Admin</Badge>}
                  {user.subscription_type !== "free" && (
                    <Badge variant="outline">{user.subscription_type}</Badge>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Location: {user.location || "Not specified"}</p>
                  <p>Joined: {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>
                  <p>Last active: {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  View Details
                </Button>
                {user.is_active ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleUserAction(user.id, "deactivate")}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUserAction(user.id, "activate")}
                  >
                    Activate
                  </Button>
                )}
                {!user.is_verified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUserAction(user.id, "verify")}
                  >
                    Verify
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Profile</p>
                <p className="font-semibold">{user.profile_completion_percentage}%</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Swipes</p>
                <p className="font-semibold">{user.total_swipes}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Matches</p>
                <p className="font-semibold">{user.total_matches}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Messages</p>
                <p className="font-semibold">{user.total_messages}</p>
              </div>
            </div>
          </Card>
        ))}

        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 