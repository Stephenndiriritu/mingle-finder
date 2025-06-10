"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Camera, X } from "lucide-react"
import { Button } from "./button"
import Image from "next/image"
import { toast } from "sonner"

interface PhotoUploadProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ photos = [], onPhotosChange, maxPhotos = 6 }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > maxPhotos) {
      toast.error(`You can only upload up to ${maxPhotos} photos`)
      return
    }

    setIsUploading(true)
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        return data.url
      })

      const newPhotoUrls = await Promise.all(uploadPromises)
      onPhotosChange([...photos, ...newPhotoUrls])
      toast.success("Photos uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload photos")
    } finally {
      setIsUploading(false)
    }
  }, [photos, onPhotosChange, maxPhotos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"]
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  })

  const removePhoto = (index: number) => {
    const newPhotos = [...photos]
    newPhotos.splice(index, 1)
    onPhotosChange(newPhotos)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={photo} className="relative aspect-square">
            <Image
              src={photo}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={`
              aspect-square rounded-lg border-2 border-dashed
              flex items-center justify-center cursor-pointer
              transition-colors
              ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"}
            `}
          >
            <input {...getInputProps()} />
            <div className="text-center space-y-2">
              <Camera className="h-8 w-8 mx-auto text-gray-400" />
              <div className="text-sm text-gray-600">
                {isDragActive ? (
                  "Drop photos here"
                ) : (
                  "Drag photos here or click to upload"
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="text-center text-sm text-gray-600">
          Uploading photos...
        </div>
      )}

      <div className="text-xs text-gray-500">
        Upload up to {maxPhotos} photos (max 5MB each)
      </div>
    </div>
  )
} 