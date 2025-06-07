import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Camera, X, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface Photo {
  url: string
  thumbnail: string
}

interface PhotoUploadProps {
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
  maxPhotos?: number
  className?: string
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 6, className }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset file input and states
    event.target.value = ""
    setError(null)
    setUploadProgress(0)

    if (photos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`)
      toast({
        title: "Upload Failed",
        description: `Maximum ${maxPhotos} photos allowed`,
        variant: "destructive",
      })
      return
    }

    // Validate file size client-side
    if (file.size > 5 * 1024 * 1024) {
      setError("File size too large. Maximum size is 5MB")
      toast({
        title: "Upload Failed",
        description: "File size too large. Maximum size is 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const { url, thumbnail, success } = await response.json()
      
      if (success) {
        onPhotosChange([...photos, { url, thumbnail }])
        toast({
          title: "Success",
          description: "Photo uploaded successfully",
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload photo"
      setError(message)
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = [...photos]
    newPhotos.splice(index, 1)
    onPhotosChange(newPhotos)
    toast({
      title: "Photo Removed",
      description: "Photo has been removed from your profile",
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={photo.url} className="relative aspect-square group">
            <Image
              src={photo.thumbnail || photo.url}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover rounded-lg transition-opacity group-hover:opacity-75"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority={index < 3} // Prioritize loading first 3 images
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => removePhoto(index)}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Remove photo"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Camera className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload photo"
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
      
      <p className="text-sm text-muted-foreground">
        Upload up to {maxPhotos} photos. JPEG, PNG or WebP. Max 5MB each.
      </p>
    </div>
  )
} 