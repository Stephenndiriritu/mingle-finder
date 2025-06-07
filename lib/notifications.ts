import pool from "@/lib/db"

interface NotificationData {
  userId: number
  type: string
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}

export async function sendNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata = {}
}: NotificationData) {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, title, message, link, metadata]
    )

    return result.rows[0]
  } catch (error) {
    console.error("Failed to send notification:", error)
    throw error
  }
}

export async function sendMatchNotification(userId1: number, userId2: number, matchId: number) {
  try {
    // Get user details
    const result = await pool.query(
      "SELECT id, name FROM users WHERE id = ANY($1)",
      [[userId1, userId2]]
    )
    const users = new Map(result.rows.map(user => [user.id, user]))

    // Send notification to both users
    await Promise.all([
      sendNotification({
        userId: userId1,
        type: "match",
        title: "New Match! 🎉",
        message: `You matched with ${users.get(userId2)?.name}!`,
        link: `/app/messages/${matchId}`,
        metadata: { matchId, otherUserId: userId2 }
      }),
      sendNotification({
        userId: userId2,
        type: "match",
        title: "New Match! 🎉",
        message: `You matched with ${users.get(userId1)?.name}!`,
        link: `/app/messages/${matchId}`,
        metadata: { matchId, otherUserId: userId1 }
      })
    ])
  } catch (error) {
    console.error("Failed to send match notifications:", error)
    throw error
  }
}

export async function sendMessageNotification(
  senderId: number,
  receiverId: number,
  matchId: number,
  messagePreview: string
) {
  try {
    // Get sender details
    const result = await pool.query(
      "SELECT name FROM users WHERE id = $1",
      [senderId]
    )
    const senderName = result.rows[0]?.name

    await sendNotification({
      userId: receiverId,
      type: "message",
      title: "New Message",
      message: `${senderName}: ${messagePreview.slice(0, 50)}${messagePreview.length > 50 ? "..." : ""}`,
      link: `/app/messages/${matchId}`,
      metadata: { matchId, senderId, messageId: matchId }
    })
  } catch (error) {
    console.error("Failed to send message notification:", error)
    throw error
  }
}

export async function sendLikeNotification(likerId: number, likedUserId: number) {
  try {
    // Only send notification if user has premium subscription
    const result = await pool.query(
      "SELECT name FROM users WHERE id = $1",
      [likerId]
    )
    const likerName = result.rows[0]?.name

    await sendNotification({
      userId: likedUserId,
      type: "like",
      title: "Someone Likes You",
      message: "Upgrade to Premium to see who likes you!",
      metadata: { likerId }
    })
  } catch (error) {
    console.error("Failed to send like notification:", error)
    throw error
  }
} 