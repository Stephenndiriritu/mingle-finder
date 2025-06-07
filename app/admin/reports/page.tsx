"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"

interface Report {
  id: number
  reason: string
  description: string
  status: "pending" | "resolved" | "dismissed"
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
  reporter_id: number
  reporter_name: string
  reporter_email: string
  reported_id: number
  reported_name: string
  reported_email: string
  resolved_by_name: string | null
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState("all")
  const [adminNotes, setAdminNotes] = useState<{ [key: number]: string }>({})
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchReports()
  }, [status, pagination.page])

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status,
      })

      const response = await fetch(`/api/admin/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportAction = async (reportId: number, action: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "dismiss" ? "dismissed" : "resolved",
          adminNotes: adminNotes[reportId],
          action: action === "warn" ? "warn" : action === "suspend" ? "suspend" : action === "ban" ? "ban" : undefined,
        }),
      })

      if (response.ok) {
        fetchReports()
        setAdminNotes((prev) => ({ ...prev, [reportId]: "" }))
      }
    } catch (error) {
      console.error("Failed to update report:", error)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports Management</h1>
        <p className="text-gray-600">Handle user reports and take appropriate actions</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">Report #{report.id}</h3>
                  <Badge
                    variant={
                      report.status === "pending"
                        ? "default"
                        : report.status === "resolved"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </p>
                <div className="mt-4">
                  <p className="font-medium">Reason:</p>
                  <p className="text-gray-600">{report.reason}</p>
                  {report.description && (
                    <>
                      <p className="font-medium mt-2">Description:</p>
                      <p className="text-gray-600">{report.description}</p>
                    </>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Reporter:</p>
                    <p className="text-sm text-gray-600">{report.reporter_name}</p>
                    <p className="text-sm text-gray-500">{report.reporter_email}</p>
                  </div>
                  <div>
                    <p className="font-medium">Reported User:</p>
                    <p className="text-sm text-gray-600">{report.reported_name}</p>
                    <p className="text-sm text-gray-500">{report.reported_email}</p>
                  </div>
                </div>
                {report.resolved_at && (
                  <div className="mt-4">
                    <p className="font-medium">Resolved by:</p>
                    <p className="text-sm text-gray-600">
                      {report.resolved_by_name} •{" "}
                      {formatDistanceToNow(new Date(report.resolved_at), { addSuffix: true })}
                    </p>
                    {report.admin_notes && (
                      <>
                        <p className="font-medium mt-2">Admin Notes:</p>
                        <p className="text-sm text-gray-600">{report.admin_notes}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              {report.status === "pending" && (
                <div className="w-full md:w-auto md:min-w-[300px]">
                  <Textarea
                    placeholder="Add admin notes..."
                    value={adminNotes[report.id] || ""}
                    onChange={(e) =>
                      setAdminNotes((prev) => ({ ...prev, [report.id]: e.target.value }))
                    }
                    className="mb-4"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReportAction(report.id, "dismiss")}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleReportAction(report.id, "warn")}
                    >
                      Warn User
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReportAction(report.id, "suspend")}
                    >
                      Suspend
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReportAction(report.id, "ban")}
                    >
                      Ban User
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No reports found</p>
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