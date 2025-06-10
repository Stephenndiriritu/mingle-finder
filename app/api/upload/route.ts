import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"

// Configure allowed file types and max size
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DIMENSION = 2048 // Max width/height
const THUMB_DIMENSION = 400 // Thumbnail size

export async function POST(request: NextRequest) {
  try {
    // For now, allow uploads without authentication for testing
    // TODO: Add proper authentication and rate limiting later

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return new NextResponse("Invalid file type", { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse("File too large", { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process image with sharp
    const processedImage = await sharp(buffer)
      .resize(800, 800, {
        fit: "cover",
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer()

    // Generate unique filename
    const filename = `${uuidv4()}.webp`
    const uploadDir = join(process.cwd(), "public/uploads")
    const filepath = join(uploadDir, filename)

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    await writeFile(filepath, processedImage)

    // Return the URL
    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to upload file" }),
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // For now, allow file deletion without authentication for testing
    // TODO: Add proper authentication later

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return new NextResponse("No filename provided", { status: 400 })
    }

    const filepath = join(process.cwd(), "public/uploads", filename)

    try {
      // For demo, just return success without actually deleting
      console.log(`Mock delete file: ${filename}`)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Failed to delete file:", error)
      return new NextResponse("Failed to delete file", { status: 500 })
    }
  } catch (error) {
    console.error("Delete error:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500 }
    )
  }
}