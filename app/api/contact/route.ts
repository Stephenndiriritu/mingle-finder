import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    // Store in database
    await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)`,
      [name, email, subject, message]
    )

    // Send notification email
    await sendEmail(
      process.env.CONTACT_EMAIL!,
      `New Contact Form Submission: ${subject}`,
      `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 