import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!process.env.SMTP_HOST) {
      console.log("Email not configured, would send:", { to, subject })
      return
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    })

    console.log(`Email sent to ${to}: ${subject}`)
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}

export function getWelcomeEmailTemplate(name: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ec4899;">Welcome to Mingle Finder, ${name}!</h1>
      <p>Thank you for joining our dating community. We're excited to help you find meaningful connections.</p>
      <p>To get started:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Add some great photos</li>
        <li>Start swiping to find matches</li>
      </ul>
      <p>Happy dating!</p>
      <p>The Mingle Finder Team</p>
    </div>
  `
}

export function getMatchNotificationTemplate(matchName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ec4899;">🎉 You have a new match!</h1>
      <p>Great news! You and ${matchName} liked each other.</p>
      <p>Start a conversation and see where it leads!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/matches" 
         style="background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View Match
      </a>
    </div>
  `
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@minglefinder.com',
    to: email,
    subject: 'Verify your email address',
    html: `Click <a href="${verificationUrl}">here</a> to verify your email address.`
  })
}
