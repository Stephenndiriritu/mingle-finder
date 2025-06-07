import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getUserFromRequest } from "@/lib/auth"
import sharp from "sharp"
import { rateLimit } from "@/lib/rate-limit"

// Configure allowed file types and max size
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DIMENSION = 2048 // Max width/height
const THUMB_DIMENSION = 400 // Thumbnail size

// Rate limiting configuration
const uploadLimiter = rateLimit({
  tokensPerInterval: 10, // 10 uploads
  interval: 60 * 1000, // per minute
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Apply rate limiting
    try {
      await uploadLimiter.check(request, `upload_${user.id}`)
    } catch {
      return NextResponse.json({ 
        error: "Too many uploads. Please wait a minute and try again.",
        retryAfter: 60 // seconds
      }, { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG and WebP images are allowed" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const extension = "webp" // Always convert to WebP for better compression
    const filename = `${user.id}_${timestamp}`

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      // Process image with Sharp
      const image = sharp(buffer)
      const metadata = await image.metadata()

      // Resize if necessary
      if (metadata.width && metadata.width > MAX_DIMENSION) {
        image.resize(MAX_DIMENSION, null, { fit: "inside" })
      } else if (metadata.height && metadata.height > MAX_DIMENSION) {
        image.resize(null, MAX_DIMENSION, { fit: "inside" })
      }

      // Create optimized version
      const optimizedImage = await image
        .webp({ quality: 80 })
        .toBuffer()

      // Create thumbnail
      const thumbnail = await image
        .resize(THUMB_DIMENSION, THUMB_DIMENSION, { fit: "cover" })
        .webp({ quality: 60 })
        .toBuffer()

      // Save files
      const mainPath = join(uploadDir, `${filename}.${extension}`)
      const thumbPath = join(uploadDir, `${filename}_thumb.${extension}`)

      await Promise.all([
        writeFile(mainPath, optimizedImage),
        writeFile(thumbPath, thumbnail)
      ])

      // Return the public URLs
      return NextResponse.json({
        url: `/uploads/${filename}.${extension}`,
        thumbnail: `/uploads/${filename}_thumb.${extension}`,
        success: true
      })
    } catch (imageError) {
      console.error("Image processing error:", imageError)
      return NextResponse.json(
        { error: "Failed to process image. Please try another file." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    )
  }
} 