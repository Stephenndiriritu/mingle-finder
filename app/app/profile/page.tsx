"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Plus, X } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { PhotoUpload } from "@/components/photo-upload"

interface Profile {
  id: number
  name: string
  email: string
  date_of_birth: string
  gender: string
  location: string
  bio: string
  interests: string[]
  photos: string[]
  age: number
  height: number
  weight: number
  occupation: string
  education: string
  looking_for: string
  relationship_type: string
  max_distance: number
  age_min: number
  age_max: number
  show_me: string
  smoking: string
  drinking: string
  children: string
  religion: string
  political_views: string
  languages: string[]
  hobbies: string[]
  profile_completion_percentage: number
  subscription_type: string
  is_verified: boolean
}

const INTERESTS_OPTIONS = [
  "Travel",
  "Photography",
  "Music",
  "Movies",
  "Books",
  "Cooking",
  "Fitness",
  "Yoga",
  "Dancing",
  "Art",
  "Technology",
  "Gaming",
  "Sports",
  "Nature",
  "Fashion",
  "Food",
  "Wine",
  "Coffee",
  "Hiking",
  "Swimming",
  "Running",
  "Cycling",
  "Meditation",
  "Pets",
]

const HOBBIES_OPTIONS = [
  "Reading",
  "Writing",
  "Painting",
  "Drawing",
  "Singing",
  "Playing Guitar",
  "Piano",
  "Gardening",
  "Collecting",
  "Board Games",
  "Video Games",
  "Chess",
  "Puzzles",
  "Crafting",
  "Knitting",
  "Woodworking",
  "Fishing",
  "Camping",
  "Rock Climbing",
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [newInterest, setNewInterest] = useState("")
  const [newHobby, setNewHobby] = useState("")
  const { user, refreshUser } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        await refreshUser()
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Profile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value })
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && profile && !profile.interests.includes(newInterest.trim())) {
      const updatedInterests = [...profile.interests, newInterest.trim()]
      handleInputChange("interests", updatedInterests)
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    if (profile) {
      const updatedInterests = profile.interests.filter((i) => i !== interest)
      handleInputChange("interests", updatedInterests)
    }
  }

  const addHobby = () => {
    if (newHobby.trim() && profile && !profile.hobbies.includes(newHobby.trim())) {
      const updatedHobbies = [...profile.hobbies, newHobby.trim()]
      handleInputChange("hobbies", updatedHobbies)
      setNewHobby("")
    }
  }

  const removeHobby = (hobby: string) => {
    if (profile) {
      const updatedHobbies = profile.hobbies.filter((h) => h !== hobby)
      handleInputChange("hobbies", updatedHobbies)
    }
  }

  const handlePhotosChange = (newPhotos: string[]) => {
    if (profile) {
      handleInputChange("photos", newPhotos)
      // Save immediately when photos change
      updateProfile({ ...profile, photos: newPhotos })
    }
  }

  const saveChanges = () => {
    if (profile) {
      updateProfile(profile)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    )
  }

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "details", label: "Details" },
    { id: "preferences", label: "Preferences" },
    { id: "lifestyle", label: "Lifestyle" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <div className="flex items-center space-x-2">
            {profile.is_verified && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Verified
              </Badge>
            )}
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {profile.subscription_type}
            </Badge>
          </div>
        </div>

        {/* Profile Completion */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-gray-600">{profile.profile_completion_percentage}%</span>
            </div>
            <Progress value={profile.profile_completion_percentage} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">Complete your profile to get better matches</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <div className="space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photos</CardTitle>
              <CardDescription>Add up to 6 photos to your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                photos={profile?.photos || []}
                onPhotosChange={handlePhotosChange}
                maxPhotos={6}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={profile.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => handleInputChange("age", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell people about yourself..."
                  value={profile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={profile.education}
                    onChange={(e) => handleInputChange("education", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
              <CardDescription>Add your interests to help find compatible matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={newInterest} onValueChange={setNewInterest}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an interest" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERESTS_OPTIONS.filter((interest) => !profile.interests.includes(interest)).map((interest) => (
                        <SelectItem key={interest} value={interest}>
                          {interest}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addInterest} disabled={!newInterest}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center space-x-1">
                      <span>{interest}</span>
                      <button onClick={() => removeInterest(interest)} className="ml-1 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Physical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) => handleInputChange("height", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight}
                    onChange={(e) => handleInputChange("weight", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relationship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="looking_for">Looking For</Label>
                  <Select
                    value={profile.looking_for}
                    onValueChange={(value) => handleInputChange("looking_for", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What are you looking for?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serious_relationship">Serious Relationship</SelectItem>
                      <SelectItem value="casual_dating">Casual Dating</SelectItem>
                      <SelectItem value="friendship">Friendship</SelectItem>
                      <SelectItem value="hookup">Hookup</SelectItem>
                      <SelectItem value="not_sure">Not Sure Yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship_type">Relationship Type</Label>
                  <Select
                    value={profile.relationship_type}
                    onValueChange={(value) => handleInputChange("relationship_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monogamous">Monogamous</SelectItem>
                      <SelectItem value="non_monogamous">Non-monogamous</SelectItem>
                      <SelectItem value="open">Open Relationship</SelectItem>
                      <SelectItem value="polyamorous">Polyamorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hobbies */}
          <Card>
            <CardHeader>
              <CardTitle>Hobbies</CardTitle>
              <CardDescription>Share your hobbies and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={newHobby} onValueChange={setNewHobby}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a hobby" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOBBIES_OPTIONS.filter((hobby) => !profile.hobbies.includes(hobby)).map((hobby) => (
                        <SelectItem key={hobby} value={hobby}>
                          {hobby}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addHobby} disabled={!newHobby}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby) => (
                    <Badge key={hobby} variant="secondary" className="flex items-center space-x-1">
                      <span>{hobby}</span>
                      <button onClick={() => removeHobby(hobby)} className="ml-1 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Preferences</CardTitle>
              <CardDescription>Set your preferences for finding matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="show_me">Show Me</Label>
                <Select value={profile.show_me} onValueChange={(value) => handleInputChange("show_me", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Who would you like to see?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Men</SelectItem>
                    <SelectItem value="female">Women</SelectItem>
                    <SelectItem value="everyone">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_distance">Maximum Distance ({profile.max_distance} km)</Label>
                <Input
                  id="max_distance"
                  type="range"
                  min="1"
                  max="100"
                  value={profile.max_distance}
                  onChange={(e) => handleInputChange("max_distance", Number.parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_min">Minimum Age</Label>
                  <Input
                    id="age_min"
                    type="number"
                    min="18"
                    max="99"
                    value={profile.age_min}
                    onChange={(e) => handleInputChange("age_min", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_max">Maximum Age</Label>
                  <Input
                    id="age_max"
                    type="number"
                    min="18"
                    max="99"
                    value={profile.age_max}
                    onChange={(e) => handleInputChange("age_max", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lifestyle Tab */}
      {activeTab === "lifestyle" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle</CardTitle>
              <CardDescription>Share your lifestyle preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smoking">Smoking</Label>
                  <Select value={profile.smoking} onValueChange={(value) => handleInputChange("smoking", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Smoking preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="socially">Socially</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                      <SelectItem value="trying_to_quit">Trying to Quit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drinking">Drinking</Label>
                  <Select value={profile.drinking} onValueChange={(value) => handleInputChange("drinking", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Drinking preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="socially">Socially</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children">Children</Label>
                  <Select value={profile.children} onValueChange={(value) => handleInputChange("children", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Children preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="have_and_want_more">Have & Want More</SelectItem>
                      <SelectItem value="have_and_dont_want_more">Have & Don't Want More</SelectItem>
                      <SelectItem value="dont_have_but_want">Don't Have But Want</SelectItem>
                      <SelectItem value="dont_have_and_dont_want">Don't Have & Don't Want</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={profile.religion}
                    onChange={(e) => handleInputChange("religion", e.target.value)}
                    placeholder="Your religion"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button onClick={saveChanges} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
