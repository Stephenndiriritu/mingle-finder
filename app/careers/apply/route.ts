import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const jobId = formData.get('jobId')
    const name = formData.get('name')
    const email = formData.get('email')
    const resume = formData.get('resume') as File

    // Store resume file (implement your file storage logic)
    const resumeUrl = await uploadResume(resume)

    // Store application
    await pool.query(
      `INSERT INTO job_applications (job_id, name, email, resume_url)
       VALUES ($1, $2, $3, $4)`,
      [jobId, name, email, resumeUrl]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Job application error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
} 