import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, position, resume, coverLetter } = await request.json()

    if (!name || !email || !position || !resume) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Save application to database
    const result = await pool.query(
      `INSERT INTO job_applications (name, email, position, resume_url, cover_letter) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, email, position, resume, coverLetter]
    )

    // Send confirmation email
    await sendEmail(
      email,
      "Application Received - Mingle Finder",
      `
      <h1>Thank you for applying to Mingle Finder!</h1>
      <p>We have received your application for the ${position} position.</p>
      <p>Our team will review your application and get back to you soon.</p>
      `
    )

    // Send notification to HR
    await sendEmail(
      process.env.HR_EMAIL || "hr@minglefinder.com",
      `New Job Application - ${position}`,
      `
      <h1>New Job Application Received</h1>
      <p>Position: ${position}</p>
      <p>Candidate: ${name} (${email})</p>
      <p>Resume: ${resume}</p>
      ${coverLetter ? `<p>Cover Letter: ${coverLetter}</p>` : ""}
      `
    )

    return NextResponse.json({
      message: "Application submitted successfully",
      application: result.rows[0]
    })
  } catch (error) {
    console.error("Failed to submit application:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
} 