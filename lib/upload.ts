import multer from "multer"
import path from "path"
import sharp from "sharp"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

export const upload = multer({
  storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || ["image/jpeg", "image/png", "image/webp"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

export async function processImage(inputPath: string, outputPath: string, width = 800, height = 800) {
  try {
    await sharp(inputPath).resize(width, height, { fit: "cover" }).jpeg({ quality: 85 }).toFile(outputPath)
    return outputPath
  } catch (error) {
    console.error("Image processing error:", error)
    throw error
  }
}
