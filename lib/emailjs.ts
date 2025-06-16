import emailjs from '@emailjs/browser'

// EmailJS Configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

// Template IDs for different email types
const TEMPLATE_IDS = {
  VERIFICATION: process.env.NEXT_PUBLIC_EMAILJS_VERIFICATION_TEMPLATE_ID,
  PASSWORD_RESET: process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID,
  WELCOME: process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID,
  MATCH_NOTIFICATION: process.env.NEXT_PUBLIC_EMAILJS_MATCH_TEMPLATE_ID,
  MESSAGE_NOTIFICATION: process.env.NEXT_PUBLIC_EMAILJS_MESSAGE_TEMPLATE_ID,
  GENERAL: process.env.NEXT_PUBLIC_EMAILJS_GENERAL_TEMPLATE_ID,
}

// Initialize EmailJS
if (typeof window !== 'undefined' && EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY)
}

// Check if EmailJS is configured
export function isEmailJSConfigured(): boolean {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY && TEMPLATE_IDS.GENERAL)
}

// Generic email sending function
export async function sendEmailJS(
  to: string,
  subject: string,
  html: string,
  templateId?: string
): Promise<boolean> {
  try {
    if (!isEmailJSConfigured()) {
      console.warn('EmailJS not configured. Email would be sent to:', to, 'Subject:', subject)
      return false
    }

    const template = templateId || TEMPLATE_IDS.GENERAL
    if (!template) {
      console.error('No template ID provided and no general template configured')
      return false
    }

    const templateParams = {
      to_email: to,
      subject: subject,
      message: html,
      from_name: 'Mingle Finder',
      reply_to: 'noreply@minglefinder.com'
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID!,
      template,
      templateParams
    )

    if (response.status === 200) {
      console.log('Email sent successfully via EmailJS:', { to, subject })
      return true
    } else {
      console.error('EmailJS send failed:', response)
      return false
    }
  } catch (error) {
    console.error('EmailJS error:', error)
    return false
  }
}

// Specific email functions
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  
  const subject = 'Verify your Mingle Finder account'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ec4899; margin: 0;">💕 Mingle Finder</h1>
      </div>
      
      <h2 style="color: #333;">Welcome to Mingle Finder!</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        Thank you for joining Mingle Finder! To complete your registration and start finding your perfect match, 
        please verify your email address by clicking the button below.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background: linear-gradient(135deg, #ec4899, #be185d); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: bold;
                  display: inline-block;">
          Verify Email Address
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verificationUrl}" style="color: #ec4899;">${verificationUrl}</a>
      </p>
      
      <p style="font-size: 14px; color: #666;">
        This verification link will expire in 24 hours for security reasons.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        If you didn't create an account with Mingle Finder, please ignore this email.
      </p>
    </div>
  `

  return await sendEmailJS(email, subject, html, TEMPLATE_IDS.VERIFICATION)
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  
  const subject = 'Reset your Mingle Finder password'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ec4899; margin: 0;">💕 Mingle Finder</h1>
      </div>
      
      <h2 style="color: #333;">Password Reset Request</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        We received a request to reset your password for your Mingle Finder account. 
        Click the button below to create a new password.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: linear-gradient(135deg, #ec4899, #be185d); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: bold;
                  display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #ec4899;">${resetUrl}</a>
      </p>
      
      <p style="font-size: 14px; color: #666;">
        This reset link will expire in 1 hour for security reasons.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `

  return await sendEmailJS(email, subject, html, TEMPLATE_IDS.PASSWORD_RESET)
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Welcome to Mingle Finder! 💕'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ec4899; margin: 0;">💕 Mingle Finder</h1>
      </div>
      
      <h2 style="color: #333;">Welcome, ${name}!</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        Congratulations! Your email has been verified and your Mingle Finder account is now active. 
        You're ready to start your journey to find meaningful connections!
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #ec4899; margin-top: 0;">🚀 Get Started:</h3>
        <ul style="color: #555; line-height: 1.8;">
          <li>Complete your profile with photos and bio</li>
          <li>Set your preferences and location</li>
          <li>Start swiping to find your matches</li>
          <li>Upgrade to Premium for unlimited messaging</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/app" 
           style="background: linear-gradient(135deg, #ec4899, #be185d); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: bold;
                  display: inline-block;">
          Start Finding Matches
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        Need help? Contact us at support@minglefinder.com
      </p>
    </div>
  `

  return await sendEmailJS(email, subject, html, TEMPLATE_IDS.WELCOME)
}

export async function sendMatchNotificationEmail(email: string, matchName: string): Promise<boolean> {
  const subject = '🎉 You have a new match!'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ec4899; margin: 0;">💕 Mingle Finder</h1>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; font-size: 28px;">🎉 It's a Match!</h2>
      </div>
      
      <p style="font-size: 18px; line-height: 1.6; color: #555; text-align: center;">
        Great news! You and <strong style="color: #ec4899;">${matchName}</strong> liked each other.
      </p>
      
      <div style="background: linear-gradient(135deg, #fdf2f8, #fce7f3); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
        <p style="font-size: 16px; color: #be185d; margin: 0;">
          💬 Start a conversation and see where it leads!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/matches" 
           style="background: linear-gradient(135deg, #ec4899, #be185d); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: bold;
                  display: inline-block;">
          View Match & Start Chatting
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        Happy matching! 💕
      </p>
    </div>
  `

  return await sendEmailJS(email, subject, html, TEMPLATE_IDS.MATCH_NOTIFICATION)
}

export async function sendMessageNotificationEmail(
  email: string, 
  senderName: string, 
  messagePreview: string
): Promise<boolean> {
  const subject = `💬 New message from ${senderName}`
  const truncatedMessage = messagePreview.length > 100 
    ? messagePreview.substring(0, 97) + '...' 
    : messagePreview

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ec4899; margin: 0;">💕 Mingle Finder</h1>
      </div>
      
      <h2 style="color: #333;">💬 New Message</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        <strong style="color: #ec4899;">${senderName}</strong> sent you a message:
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899;">
        <p style="font-style: italic; color: #666; margin: 0; font-size: 16px;">
          "${truncatedMessage}"
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/conversations" 
           style="background: linear-gradient(135deg, #ec4899, #be185d); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: bold;
                  display: inline-block;">
          Reply Now
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        You can manage your notification preferences in your account settings.
      </p>
    </div>
  `

  return await sendEmailJS(email, subject, html, TEMPLATE_IDS.MESSAGE_NOTIFICATION)
}

// Backward compatibility function to match the existing sendEmail signature
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const success = await sendEmailJS(to, subject, html)
  if (!success) {
    throw new Error('Failed to send email via EmailJS')
  }
}
