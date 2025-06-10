"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow, format } from "date-fns"

interface UserDetails {
  id: number
  email: string
  name: string
  birthdate: string
  gender: string
  location: string
  latitude: number | null
  longitude: number | null
  is_active: boolean
  is_admin: boolean
  is_verified: boolean
  subscription_type: string
  subscription_expires_at: string | null
  last_active: string
  created_at: string
  bio: string | null
  interests: string[]
  photos: string[]
  age: number
  height: number | null
  weight: number | null
  occupation: string | null
  education: string | null
  looking_for: string | null
  relationship_type: string | null
  max_distance: number
  age_min: number
  age_max: number
  show_me: string
  smoking: string | null
  drinking: string | null
  children: string | null
  religion: string | null
  political_views: string | null
  languages: string[]
  hobbies: string[]
  profile_completion_percentage: number
  verification_status: string
  total_swipes: number
  total_likes: number
  total_matches: number
  total_messages: number
  reports_against: number
  reports_made: number
}

interface Activity {
  activity_type: string
  activity_data: any
  created_at: string
}

interface Report {
  id: number
  reason: string
  description: string
  status: string
  created_at: string
  reporter_name: string
  reporter_email: string
}

export default function UserDetailsPage() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUserDetails(data.user)
        setRecentActivity(data.recentActivity)
        setRecentReports(data.recentReports)
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async (action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: action === "activate" ? true : action === "deactivate" ? false : undefined,
          isVerified: action === "verify" ? true : action === "unverify" ? false : undefined,
          subscriptionType: action === "upgrade" ? "gold" : action === "downgrade" ? "free" : undefined,
        }),
      })

      if (response.ok) {
        fetchUserDetails()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/users")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">Unauthorized access</p>
      </div>
    )
  }

  if (isLoading || !userDetails) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Details</h1>
          <p className="text-gray-600">Manage user information and actions</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Users
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">{userDetails.name}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={userDetails.is_active ? "success" : "secondary"}>
                  {userDetails.is_active ? "Active" : "Inactive"}
                </Badge>
                {userDetails.is_verified && <Badge variant="default">Verified</Badge>}
                {userDetails.is_admin && <Badge variant="destructive">Admin</Badge>}
                <Badge variant="outline">{userDetails.subscription_type}</Badge>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Email: {userDetails.email}</p>
                <p>Location: {userDetails.location || "Not specified"}</p>
                <p>Joined: {format(new Date(userDetails.created_at), "PPP")}</p>
                <p>Last active: {formatDistanceToNow(new Date(userDetails.last_active), { addSuffix: true })}</p>
                {userDetails.subscription_expires_at && (
                  <p>
                    Subscription expires:{" "}
                    {format(new Date(userDetails.subscription_expires_at), "PPP")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {userDetails.is_active ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleUserAction("deactivate")}
                >
                  Deactivate Account
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleUserAction("activate")}
                >
                  Activate Account
                </Button>
              )}
              {!userDetails.is_verified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserAction("verify")}
                >
                  Verify User
                </Button>
              )}
              {userDetails.subscription_type === "free" ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleUserAction("upgrade")}
                >
                  Upgrade to Gold
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserAction("downgrade")}
                >
                  Downgrade to Free
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteUser}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card className="p-6">
              <div className="grid gap-6">
                <div>
                  <h3 className="font-medium mb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Age</p>
                      <p>{userDetails.age}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p>{userDetails.gender || "Not specified"}</p>
                    </div>
                    {userDetails.height && (
                      <div>
                        <p className="text-gray-500">Height</p>
                        <p>{userDetails.height} cm</p>
                      </div>
                    )}
                    {userDetails.occupation && (
                      <div>
                        <p className="text-gray-500">Occupation</p>
                        <p>{userDetails.occupation}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-sm text-gray-600">{userDetails.bio || "No bio provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Interests & Hobbies</h3>
                  <div className="flex flex-wrap gap-2">
                    {userDetails.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                    {userDetails.hobbies.map((hobby) => (
                      <Badge key={hobby} variant="outline">
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Looking for</p>
                      <p>{userDetails.looking_for || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Relationship Type</p>
                      <p>{userDetails.relationship_type || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Age Range</p>
                      <p>{userDetails.age_min} - {userDetails.age_max} years</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Maximum Distance</p>
                      <p>{userDetails.max_distance} km</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Stats</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="text-2xl font-bold">{userDetails.total_swipes}</p>
                      <p className="text-sm text-gray-500">Total Swipes</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="text-2xl font-bold">{userDetails.total_matches}</p>
                      <p className="text-sm text-gray-500">Matches</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="text-2xl font-bold">{userDetails.total_messages}</p>
                      <p className="text-sm text-gray-500">Messages</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="text-2xl font-bold">{userDetails.profile_completion_percentage}%</p>
                      <p className="text-sm text-gray-500">Profile Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6">
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {activity.activity_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                      {activity.activity_data && (
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">
                          {JSON.stringify(activity.activity_data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-center text-gray-500">No recent activity</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-6">
              <div className="space-y-6">
                {recentReports.map((report) => (
                  <div key={report.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Report #{report.id}</h4>
                      <Badge variant={
                        report.status === "pending"
                          ? "default"
                          : report.status === "resolved"
                          ? "success"
                          : "secondary"
                      }>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-gray-500">{report.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Reported by {report.reporter_name} •{" "}
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
                {recentReports.length === 0 && (
                  <p className="text-center text-gray-500">No reports found</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 