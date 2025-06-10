import { Server as SocketIOServer } from "socket.io"
import { createServer } from "http"
import { NextRequest } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import pool from "@/lib/db"
import { sendMessageNotification } from "@/lib/notifications"

// Store active connections
const connections = new Map()

// Create HTTP server
const httpServer = createServer()

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  path: "/api/socket",
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId
  if (!userId) {
    socket.disconnect()
    return
  }

  console.log(`User connected: ${userId}`)
  
  // Store connection
  connections.set(userId, socket)

  // Handle joining chat rooms
  socket.on("join_chat", (data) => {
    const { matchId } = data
    if (matchId) {
      socket.join(matchId)
      console.log(`User ${userId} joined chat room: ${matchId}`)
    }
  })

  // Handle messages
  socket.on("send_message", async (data) => {
    const { matchId, receiverId, message } = data
    
    if (!matchId || !receiverId || !message) return
    
    try {
      // Emit to everyone in the match room (including sender for consistency)
      io.to(matchId).emit("new_message", {
        id: Date.now(), // Temporary ID until DB confirms
        sender_id: userId,
        receiver_id: receiverId,
        message,
        created_at: new Date().toISOString(),
        sender_name: "", // Will be filled by client
      })
      
      // Send notification if receiver is not in the chat room
      const receiverSocket = connections.get(receiverId.toString())
      const isReceiverInRoom = receiverSocket?.rooms?.has(matchId)
      
      if (!isReceiverInRoom) {
        // Get sender name for notification
        const result = await pool.query(
          "SELECT name FROM users WHERE id = $1",
          [userId]
        )
        
        if (result.rows.length > 0) {
          await sendMessageNotification(
            userId,
            receiverId,
            parseInt(matchId),
            message
          )
        }
      }
    } catch (error) {
      console.error("Error handling message:", error)
    }
  })

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { matchId, receiverId } = data
    
    if (!matchId || !receiverId) return
    
    socket.to(matchId).emit("user_typing", {
      userId,
      matchId
    })
  })

  // Handle stop typing
  socket.on("stop_typing", (data) => {
    const { matchId, receiverId } = data
    
    if (!matchId || !receiverId) return
    
    socket.to(matchId).emit("user_stop_typing", {
      userId,
      matchId
    })
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    connections.delete(userId)
    console.log(`User disconnected: ${userId}`)
  })
})

// Start the server on a specific port
const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10)
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // For Next.js App Router, we need to return a Response object
  // that indicates the WebSocket upgrade was successful
  return new Response(null, {
    status: 101,
    headers: {
      "Upgrade": "websocket",
      "Connection": "Upgrade"
    }
  })
} 
