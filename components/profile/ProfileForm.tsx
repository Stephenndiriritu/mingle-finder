"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Plus, X } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PhotoUpload } from "@/components/ui/photo-upload"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  bio: string
  birthDate: string
  gender: string
  interests: string[]
  photos: string[]
  height: number
  occupation: string
  education: string
  location: string
  lookingFor: string
  relationshipType: string
  maxDistance: number
  ageMin: number
  ageMax: number
  showMe: string
  smoking: string
  drinking: string
  children: string
  religion: string
  languages: string[]
  hobbies: string[]
  profileCompletionPercentage: number
  createdAt: string
  updatedAt: string
}

interface ProfileFormProps {
  initialData: Profile
  userId: string
}

const INTERESTS_OPTIONS = [
  "Travel", "Photography", "Music", "Movies", "Books", "Cooking", "Fitness",
  "Yoga", "Dancing", "Art", "Technology", "Gaming", "Sports", "Nature",
  "Fashion", "Food", "Wine", "Coffee", "Hiking", "Swimming", "Running",
  "Cycling", "Meditation", "Pets"
]

const HOBBIES_OPTIONS = [
  "Reading", "Writing", "Painting", "Drawing", "Singing", "Playing Guitar",
  "Piano", "Gardening", "Collecting", "Board Games", "Video Games", "Chess",
  "Puzzles", "Crafting", "Knitting", "Woodworking", "Fishing", "Camping",
  "Rock Climbing"
]

export default function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const [profile, setProfile] = useState<Profile>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [newInterest, setNewInterest] = useState("")
  const [newHobby, setNewHobby] = useState("")

  const updateProfile = async (updates: Partial<Profile>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updates, userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()
      setProfile(data.profile)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Profile, value: any) => {
    setProfile({ ...profile, [field]: value })
  }

  const addInterest = () => {
    if (newInterest && !profile.interests.includes(newInterest)) {
      const updatedInterests = [...profile.interests, newInterest]
      handleInputChange("interests", updatedInterests)
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    const updatedInterests = profile.interests.filter(i => i !== interest)
    handleInputChange("interests", updatedInterests)
  }

  const addHobby = () => {
    if (newHobby && !profile.hobbies.includes(newHobby)) {
      const updatedHobbies = [...profile.hobbies, newHobby]
      handleInputChange("hobbies", updatedHobbies)
      setNewHobby("")
    }
  }

  const removeHobby = (hobby: string) => {
    const updatedHobbies = profile.hobbies.filter(h => h !== hobby)
    handleInputChange("hobbies", updatedHobbies)
  }

  const handlePhotosChange = async (newPhotos: string[]) => {
    handleInputChange("photos", newPhotos)
    await updateProfile({ ...profile, photos: newPhotos })
  }

  const saveChanges = () => {
    updateProfile(profile)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Completion */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-gray-600">{profile.profileCompletionPercentage}%</span>
          </div>
          <Progress value={profile.profileCompletionPercentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">Complete your profile to get better matches</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photos</CardTitle>
              <CardDescription>Add up to 6 photos to your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                photos={profile.photos}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
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

              <div className="grid grid-cols-2 gap-4">
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
                      {INTERESTS_OPTIONS.filter(interest => !profile.interests.includes(interest)).map(interest => (
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
                  {profile.interests.map(interest => (
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
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Physical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) => handleInputChange("height", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lookingFor">Looking For</Label>
                  <Select value={profile.lookingFor} onValueChange={(value) => handleInputChange("lookingFor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="What are you looking for?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serious_relationship">Serious Relationship</SelectItem>
                      <SelectItem value="casual_dating">Casual Dating</SelectItem>
                      <SelectItem value="friendship">Friendship</SelectItem>
                      <SelectItem value="not_sure">Not Sure Yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationshipType">Relationship Type</Label>
                  <Select
                    value={profile.relationshipType}
                    onValueChange={(value) => handleInputChange("relationshipType", value)}
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
                      {HOBBIES_OPTIONS.filter(hobby => !profile.hobbies.includes(hobby)).map(hobby => (
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
                  {profile.hobbies.map(hobby => (
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
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Preferences</CardTitle>
              <CardDescription>Set your preferences for finding matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="showMe">Show Me</Label>
                <Select value={profile.showMe} onValueChange={(value) => handleInputChange("showMe", value)}>
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
                <Label htmlFor="maxDistance">Maximum Distance ({profile.maxDistance} km)</Label>
                <Input
                  id="maxDistance"
                  type="range"
                  min="1"
                  max="100"
                  value={profile.maxDistance}
                  onChange={(e) => handleInputChange("maxDistance", Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageMin">Minimum Age</Label>
                  <Input
                    id="ageMin"
                    type="number"
                    min="18"
                    max="99"
                    value={profile.ageMin}
                    onChange={(e) => handleInputChange("ageMin", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageMax">Maximum Age</Label>
                  <Input
                    id="ageMax"
                    type="number"
                    min="18"
                    max="99"
                    value={profile.ageMax}
                    onChange={(e) => handleInputChange("ageMax", Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle</CardTitle>
              <CardDescription>Share your lifestyle preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t mt-6">
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