"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Bell, Shield, CreditCard, User, Lock, Trash2, Crown, Eye, EyeOff, Check } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"

interface UserPreferences {
  push_notifications: boolean
  email_notifications: boolean
  match_notifications: boolean
  message_notifications: boolean
  marketing_emails: boolean
  privacy_mode: boolean
  show_online_status: boolean
  show_distance: boolean
  auto_play_videos: boolean
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const { user, logout, subscription, availablePlans } = useAuth()
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    fetchPreferences()
    fetchSubscription()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/preferences")
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/user/subscription")
      if (response.ok) {
        const data = await response.json()
        // Assuming data.subscription is the subscription object
        // You might want to update this to match your actual data structure
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    } finally {
      setIsLoadingSubscription(false)
    }
  }

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error("Failed to update preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    if (preferences) {
      const updated = { ...preferences, [key]: value }
      setPreferences(updated)
      updatePreferences({ [key]: value })
    }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        alert("Password changed successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const data = await response.json()
        alert(data.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Failed to change password:", error)
      alert("Failed to change password")
    }
  }

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Account deleted successfully")
        logout()
      } else {
        alert("Failed to delete account")
      }
    } catch (error) {
      console.error("Failed to delete account:", error)
      alert("Failed to delete account")
    }
  }

  const handleUpgradeClick = async (planId: string) => {
    // Implement the logic to handle upgrading to a new plan
    console.log("Upgrading to plan:", planId)
  }

  const handleSubscriptionAction = async (action: string) => {
    setIsActionLoading(true)
    try {
      const response = await fetch("/api/user/subscription", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
        alert("Subscription action handled successfully")
      } else {
        alert("Failed to handle subscription action")
      }
    } catch (error) {
      console.error("Failed to handle subscription action:", error)
      alert("Failed to handle subscription action")
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm text-gray-600">{user?.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <div>
                <Label>Subscription</Label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600 capitalize">{user?.subscription_type}</p>
                  {user?.subscription_type !== "free" && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
              </div>
              <div>
                <Label>Account Status</Label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">{user?.is_verified ? "Verified" : "Unverified"}</p>
                  {user?.is_verified && <Shield className="h-4 w-4 text-green-500" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push_notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    id="push_notifications"
                    checked={preferences.push_notifications}
                    onCheckedChange={(checked) => handlePreferenceChange("push_notifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => handlePreferenceChange("email_notifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="match_notifications">Match Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified when you have new matches</p>
                  </div>
                  <Switch
                    id="match_notifications"
                    checked={preferences.match_notifications}
                    onCheckedChange={(checked) => handlePreferenceChange("match_notifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="message_notifications">Message Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified when you receive messages</p>
                  </div>
                  <Switch
                    id="message_notifications"
                    checked={preferences.message_notifications}
                    onCheckedChange={(checked) => handlePreferenceChange("message_notifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing_emails">Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
                  </div>
                  <Switch
                    id="marketing_emails"
                    checked={preferences.marketing_emails}
                    onCheckedChange={(checked) => handlePreferenceChange("marketing_emails", checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy</span>
            </CardTitle>
            <CardDescription>Control your privacy and visibility settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="privacy_mode">Privacy Mode</Label>
                    <p className="text-sm text-gray-500">Only show your profile to people you've liked</p>
                  </div>
                  <Switch
                    id="privacy_mode"
                    checked={preferences.privacy_mode}
                    onCheckedChange={(checked) => handlePreferenceChange("privacy_mode", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_online_status">Show Online Status</Label>
                    <p className="text-sm text-gray-500">Let others see when you're online</p>
                  </div>
                  <Switch
                    id="show_online_status"
                    checked={preferences.show_online_status}
                    onCheckedChange={(checked) => handlePreferenceChange("show_online_status", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_distance">Show Distance</Label>
                    <p className="text-sm text-gray-500">Display distance on your profile</p>
                  </div>
                  <Switch
                    id="show_distance"
                    checked={preferences.show_distance}
                    onCheckedChange={(checked) => handlePreferenceChange("show_distance", checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={changePassword}>Change Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Subscription</span>
            </CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSubscription ? (
              <div className="flex justify-center p-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-medium">
                      Current Plan: {subscription?.type.charAt(0).toUpperCase() + subscription?.type.slice(1)}
                    </p>
                    {subscription?.expires_at && (
                      <p className="text-sm text-muted-foreground">
                        Expires on {new Date(subscription.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {subscription?.type !== "free" && (
                    <Button
                      variant="outline"
                      onClick={() => handleSubscriptionAction("cancel")}
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>
                  )}
                </div>

                {subscription?.type === "free" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(availablePlans).map(([planId, plan]) => (
                      <Card key={planId}>
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>
                            Unlock premium features and enhance your experience
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 mb-4">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                            onClick={() => handleUpgradeClick(planId)}
                          >
                            Choose {plan.name}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" onClick={deleteAccount} className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
