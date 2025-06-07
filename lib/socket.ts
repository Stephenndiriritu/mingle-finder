import { Server as SocketIOServer, Socket } from "socket.io"
import type { Server as HTTPServer } from "http"
import { verifyToken } from "./auth"
import pool from "./db"

declare module "socket.io" {
  interface Socket {
    userId: number
  }
}

export class SocketManager {
  private io: SocketIOServer
  private userSockets: Map<number, string> = new Map()

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    this.setupSocketHandlers()
  }

  private setupSocketHandlers() {
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token
      const user = verifyToken(token)

      if (!user) {
        return next(new Error("Authentication error"))
      }

      socket.userId = user.id
      next()
    })

    this.io.on("connection", (socket: Socket) => {
      console.log(`User ${socket.userId} connected`)
      this.userSockets.set(socket.userId, socket.id)

      this.updateUserOnlineStatus(socket.userId, true)

      socket.on("join_match", (matchId) => {
        socket.join(`match_${matchId}`)
      })

      socket.on("send_message", async (data) => {
        try {
          const { matchId, message, receiverId } = data

          const result = await pool.query(
            `INSERT INTO messages (match_id, sender_id, receiver_id, message) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [matchId, socket.userId, receiverId, message],
          )

          const newMessage = result.rows[0]
          this.io.to(`match_${matchId}`).emit("new_message", newMessage)

          const receiverSocketId = this.userSockets.get(receiverId)
          if (!receiverSocketId) {
            await this.sendPushNotification(receiverId, "New Message", message)
          }
        } catch (error) {
          console.error("Error sending message:", error)
          socket.emit("error", "Failed to send message")
        }
      })

      socket.on("typing", (data) => {
        const { matchId, receiverId } = data
        const receiverSocketId = this.userSockets.get(receiverId)
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit("user_typing", {
            matchId,
            userId: socket.userId,
          })
        }
      })

      socket.on("stop_typing", (data) => {
        const { matchId, receiverId } = data
        const receiverSocketId = this.userSockets.get(receiverId)
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit("user_stop_typing", {
            matchId,
            userId: socket.userId,
          })
        }
      })

      socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`)
        this.userSockets.delete(socket.userId)
        this.updateUserOnlineStatus(socket.userId, false)
      })
    })
  }

  private async updateUserOnlineStatus(userId: number, isOnline: boolean) {
    try {
      await pool.query("UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1", [userId])
    } catch (error) {
      console.error("Error updating user online status:", error)
    }
  }

  private async sendPushNotification(userId: number, title: string, body: string) {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message) 
         VALUES ($1, $2, $3, $4)`,
        [userId, "message", title, body],
      )

      console.log(`Push notification sent to user ${userId}: ${title}`)
    } catch (error) {
      console.error("Error sending push notification:", error)
    }
  }

  public sendNotificationToUser(userId: number, notification: any) {
    const socketId = this.userSockets.get(userId)
    if (socketId) {
      this.io.to(socketId).emit("notification", notification)
    }
  }

  public sendMatchNotification(userId1: number, userId2: number) {
    const socket1 = this.userSockets.get(userId1)
    const socket2 = this.userSockets.get(userId2)

    if (socket1) {
      this.io.to(socket1).emit("new_match", { userId: userId2 })
    }
    if (socket2) {
      this.io.to(socket2).emit("new_match", { userId: userId1 })
    }
  }
}

let socketManager: SocketManager | null = null

export function initializeSocket(server: HTTPServer) {
  if (!socketManager) {
    socketManager = new SocketManager(server)
  }
  return socketManager
}

export function getSocketManager() {
  return socketManager
}
