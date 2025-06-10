import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export function calculateAge(birthDate: string | Date) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return Math.round(d)
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function generateUsername(firstName: string, lastName: string) {
  const base = `${firstName.toLowerCase()}${lastName.toLowerCase()}`
  const random = Math.floor(Math.random() * 1000)
  return `${base}${random}`
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isStrongPassword(password: string) {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  )
}

export function getProfileCompletionPercentage(profile: any) {
  const requiredFields = [
    "firstName",
    "lastName",
    "birthDate",
    "gender",
    "photos",
    "bio",
    "location",
  ]

  const optionalFields = [
    "interests",
    "hobbies",
    "occupation",
    "education",
    "height",
    "smoking",
    "drinking",
    "children",
    "religion",
    "languages",
  ]

  let completedFields = 0
  let totalFields = requiredFields.length + optionalFields.length

  // Check required fields (worth 2 points each)
  for (const field of requiredFields) {
    if (profile[field]) {
      if (Array.isArray(profile[field])) {
        if (profile[field].length > 0) completedFields += 2
      } else {
        completedFields += 2
      }
    }
  }

  // Check optional fields (worth 1 point each)
  for (const field of optionalFields) {
    if (profile[field]) {
      if (Array.isArray(profile[field])) {
        if (profile[field].length > 0) completedFields += 1
      } else {
        completedFields += 1
      }
    }
  }

  // Calculate percentage (max points = requiredFields * 2 + optionalFields)
  const maxPoints = requiredFields.length * 2 + optionalFields.length
  return Math.round((completedFields / maxPoints) * 100)
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function getTimeAgo(date: string | Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"
  
  return "just now"
}
