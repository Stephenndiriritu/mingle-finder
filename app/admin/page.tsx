"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { BarChart, LineChart } from "@/components/charts"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalMatches: number
  premiumUsers: number
  pendingReports: number
  dailyActivity: { date: string; new_users: number }[]
  subscriptions: { subscription_type: string; count: number }[]
  topLocations: { location: string; user_count: number }[]
  ageDistribution: { age_group: string; count: number }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/analytics")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Users</h3>
          <p className="text-3xl font-bold">{stats?.activeUsers || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Matches</h3>
          <p className="text-3xl font-bold">{stats?.totalMatches || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Premium Users</h3>
          <p className="text-3xl font-bold">{stats?.premiumUsers || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <LineChart
            data={stats?.dailyActivity || []}
            xKey="date"
            yKey="new_users"
            xLabel="Date"
            yLabel="New Users"
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
          <BarChart
            data={stats?.ageDistribution || []}
            xKey="age_group"
            yKey="count"
            xLabel="Age Group"
            yLabel="Users"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/users" className="block">
          <Card className="p-6 hover:bg-gray-50 transition-colors">
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </Card>
        </Link>
        <Link href="/admin/reports" className="block">
          <Card className="p-6 hover:bg-gray-50 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Reports</h3>
            <p className="text-gray-600">
              Handle user reports ({stats?.pendingReports || 0} pending)
            </p>
          </Card>
        </Link>
        <Link href="/admin/testimonials" className="block">
          <Card className="p-6 hover:bg-gray-50 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Testimonials</h3>
            <p className="text-gray-600">Review and manage user testimonials</p>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Subscription Distribution</h3>
          <div className="space-y-4">
            {stats?.subscriptions.map((sub) => (
              <div key={sub.subscription_type} className="flex justify-between items-center">
                <span className="capitalize">{sub.subscription_type}</span>
                <span className="font-semibold">{sub.count} users</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
          <div className="space-y-4">
            {stats?.topLocations.map((loc) => (
              <div key={loc.location} className="flex justify-between items-center">
                <span>{loc.location}</span>
                <span className="font-semibold">{loc.user_count} users</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
} 