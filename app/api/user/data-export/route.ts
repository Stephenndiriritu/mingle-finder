import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { createObjectCsvWriter } from "csv-writer"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create export ID
    const exportId = uuidv4()
    const exportDir = path.join(process.cwd(), "tmp", "exports", exportId)
    await fs.mkdir(exportDir, { recursive: true })

    // Export user data
    const userData = await pool.query(
      `SELECT id, email, name, date_of_birth, gender, location,
              created_at, last_active, subscription_type
       FROM users WHERE id = $1`,
      [user.id]
    )

    // Export profile data
    const profileData = await pool.query(
      `SELECT bio, interests, photos, age, height, occupation,
              education, looking_for, max_distance, age_min, age_max,
              show_me, created_at, updated_at
       FROM profiles WHERE user_id = $1`,
      [user.id]
    )

    // Export matches
    const matchesData = await pool.query(
      `SELECT m.id, m.created_at,
              u.name as matched_with_name,
              u.email as matched_with_email
       FROM matches m
       JOIN users u ON (m.user1_id = u.id OR m.user2_id = u.id)
       WHERE (m.user1_id = $1 OR m.user2_id = $1)
         AND u.id != $1`,
      [user.id]
    )

    // Export messages
    const messagesData = await pool.query(
      `SELECT m.content, m.created_at,
              CASE WHEN m.sender_id = $1 THEN 'sent' ELSE 'received' END as direction,
              u.name as other_party_name
       FROM messages m
       JOIN users u ON (
         CASE WHEN m.sender_id = $1 
           THEN m.receiver_id = u.id 
           ELSE m.sender_id = u.id 
         END
       )
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.created_at DESC`,
      [user.id]
    )

    // Write data to CSV files
    const userCsvWriter = createObjectCsvWriter({
      path: path.join(exportDir, "user.csv"),
      header: Object.keys(userData.rows[0]).map(key => ({ id: key, title: key })),
    })
    await userCsvWriter.writeRecords(userData.rows)

    const profileCsvWriter = createObjectCsvWriter({
      path: path.join(exportDir, "profile.csv"),
      header: Object.keys(profileData.rows[0]).map(key => ({ id: key, title: key })),
    })
    await profileCsvWriter.writeRecords(profileData.rows)

    const matchesCsvWriter = createObjectCsvWriter({
      path: path.join(exportDir, "matches.csv"),
      header: Object.keys(matchesData.rows[0]).map(key => ({ id: key, title: key })),
    })
    await matchesCsvWriter.writeRecords(matchesData.rows)

    const messagesCsvWriter = createObjectCsvWriter({
      path: path.join(exportDir, "messages.csv"),
      header: Object.keys(messagesData.rows[0]).map(key => ({ id: key, title: key })),
    })
    await messagesCsvWriter.writeRecords(messagesData.rows)

    // Create ZIP file
    const zipFileName = `mingle-finder-data-${exportId}.zip`
    const zipFilePath = path.join(exportDir, zipFileName)
    
    // Use native zip command for better performance
    const { exec } = require("child_process")
    await new Promise((resolve, reject) => {
      exec(
        `cd "${exportDir}" && zip -r "${zipFileName}" .`,
        (error: any) => {
          if (error) reject(error)
          else resolve(null)
        }
      )
    })

    // Send email with download link
    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/user/data-export/${exportId}/download`
    await sendEmail({
      to: user.email,
      subject: "Your data export is ready",
      html: `
        <h1>Your data export is ready</h1>
        <p>Click the link below to download your data:</p>
        <a href="${downloadUrl}">${downloadUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    })

    // Save export record
    await pool.query(
      `INSERT INTO data_exports (user_id, export_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, exportId]
    )

    return NextResponse.json({
      message: "Data export initiated. You will receive an email when it's ready.",
      exportId,
    })
  } catch (error) {
    console.error("Failed to export data:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
} 