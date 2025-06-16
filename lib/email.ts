// EmailJS implementation for sending emails
import {
  sendEmail as sendEmailJS,
  sendVerificationEmail as sendVerificationEmailJS,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendMatchNotificationEmail,
  sendMessageNotificationEmail,
  isEmailJSConfigured
} from './emailjs'

// Main email function - uses EmailJS
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    if (!isEmailJSConfigured()) {
      console.warn('EmailJS not configured. Email would be sent to:', to, 'Subject:', subject)
      return
    }

    await sendEmailJS(to, subject, html)
    console.log('Email sent successfully via EmailJS to:', to)
  } catch (error) {
    console.error('Failed to send email via EmailJS:', error)
    throw new Error('Failed to send email')
  }
}

// Export specific email functions for convenience
export {
  sendVerificationEmailJS as sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendMatchNotificationEmail,
  sendMessageNotificationEmail,
  isEmailJSConfigured
}

// Backward compatibility template functions
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
