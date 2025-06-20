import pool from "@/lib/db"
import { sendEmail, sendMatchNotificationEmail, sendMessageNotificationEmail } from "@/lib/email"

/**
 * Send a notification for a new message
 */
export async function sendMessageNotification(
  senderId: number,
  receiverId: number,
  matchId: number,
  message: string
) {
  try {
    // Get sender and receiver info
    const usersResult = await pool.query(
      `SELECT u1.id as sender_id, u1.name as sender_name, u1.email as sender_email,
              u2.id as receiver_id, u2.name as receiver_name, u2.email as receiver_email,
              u2.notification_preferences
       FROM users u1, users u2
       WHERE u1.id = $1 AND u2.id = $2`,
      [senderId, receiverId]
    )
    
    if (usersResult.rows.length === 0) {
      return
    }
    
    const userInfo = usersResult.rows[0]
    const notificationPrefs = userInfo.notification_preferences || {}
    
    // Check if user has message notifications enabled
    if (notificationPrefs.messages === false) {
      return
    }
    
    // Store notification in database
    await pool.query(
      `INSERT INTO notifications (user_id, type, content, related_id, is_read)
       VALUES ($1, 'message', $2, $3, false)`,
      [
        receiverId,
        `New message from ${userInfo.sender_name}`,
        matchId
      ]
    )
    
    // Send email notification if enabled
    if (notificationPrefs.email_messages !== false) {
      const truncatedMessage = message.length > 100
        ? message.substring(0, 97) + '...'
        : message

      await sendMessageNotificationEmail(
        userInfo.receiver_email,
        userInfo.sender_name,
        truncatedMessage
      )
    }
    
    // Send push notification if enabled (implementation depends on your push service)
    if (notificationPrefs.push_messages !== false) {
      // Implementation for push notifications would go here
      // This depends on your push notification service
    }
  } catch (error) {
    console.error('Failed to send message notification:', error)
  }
}
