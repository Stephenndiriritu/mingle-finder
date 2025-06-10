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
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const fetchStats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true)
      console.log('Fetching real-time admin analytics...')

      const response = await fetch("/api/admin/analytics", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastUpdated(new Date().toLocaleTimeString())
        console.log('Admin analytics updated:', {
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          totalMatches: data.totalMatches,
          lastUpdated: data.lastUpdated
        })
      } else {
        console.error('Failed to fetch analytics:', response.status)
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setIsLoading(false)
      if (showRefreshing) setIsRefreshing(false)
    }
  }

  useEffect(() => {
    console.log('Admin dashboard - user:', user, 'authLoading:', authLoading)

    // Only fetch stats if we have a user and they're an admin
    if (user?.isAdmin) {
      fetchStats()

      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => fetchStats(false), 30000)
      setRefreshInterval(interval)

      // Cleanup interval on unmount
      return () => {
        if (interval) clearInterval(interval)
      }
    } else if (!authLoading) {
      setIsLoading(false)
    }
  }, [user, authLoading])

  const handleManualRefresh = () => {
    fetchStats(true)
  }

  // Show loading while auth is loading
  if (authLoading || (isLoading && !user)) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user?.isAdmin) {
    console.log('Admin access denied for user:', user)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
        <p className="text-sm text-gray-500 mt-2">User: {user?.email || 'Not logged in'}</p>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 font-medium">Real-time data</span>
          <span className="text-green-600 text-sm">• Auto-refreshes every 30 seconds</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Total Users</h3>
          <p className="text-3xl font-bold text-blue-900">{stats?.totalUsers?.toLocaleString() || 0}</p>
          {stats?.newUsers30d && (
            <p className="text-sm text-blue-600 mt-1">+{stats.newUsers30d} this month</p>
          )}
        </Card>
        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <h3 className="text-lg font-semibold mb-2 text-green-800">Active Users (24h)</h3>
          <p className="text-3xl font-bold text-green-900">{stats?.activeUsers?.toLocaleString() || 0}</p>
          {stats?.activeUsers7d && (
            <p className="text-sm text-green-600 mt-1">{stats.activeUsers7d.toLocaleString()} this week</p>
          )}
        </Card>
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <h3 className="text-lg font-semibold mb-2 text-purple-800">Total Matches</h3>
          <p className="text-3xl font-bold text-purple-900">{stats?.totalMatches?.toLocaleString() || 0}</p>
          {stats?.matches24h && (
            <p className="text-sm text-purple-600 mt-1">+{stats.matches24h} today</p>
          )}
        </Card>
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">Premium Users</h3>
          <p className="text-3xl font-bold text-yellow-900">{stats?.premiumUsers?.toLocaleString() || 0}</p>
          {stats?.conversionRate && (
            <p className="text-sm text-yellow-600 mt-1">{stats.conversionRate}% conversion rate</p>
          )}
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Messages</h3>
          <p className="text-2xl font-bold">{stats?.totalMessages?.toLocaleString() || 0}</p>
          {stats?.messages24h && (
            <p className="text-sm text-gray-600 mt-1">+{stats.messages24h} today</p>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Verified Users</h3>
          <p className="text-2xl font-bold">{stats?.verifiedUsers?.toLocaleString() || 0}</p>
          {stats?.verificationRate && (
            <p className="text-sm text-gray-600 mt-1">{stats.verificationRate}% verified</p>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Database Status</h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stats?.error ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`font-medium ${stats?.error ? 'text-red-600' : 'text-green-600'}`}>
              {stats?.error ? 'Disconnected' : 'Connected'}
            </span>
          </div>
          {stats?.error && (
            <p className="text-sm text-red-600 mt-1">Using fallback data</p>
          )}
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