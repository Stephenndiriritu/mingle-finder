import { type NextRequest } from "next/server"
import { Server } from "socket.io"
import { getUserFromRequest } from "@/lib/auth"

const io = new Server({
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  addTrailingSlash: false,
  path: "/api/socket"
})

// Store active connections
const connections = new Map()

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId
  if (!userId) {
    socket.disconnect()
    return
  }

  // Store connection
  connections.set(userId, socket)

  // Handle messages
  socket.on("send_message", async (data) => {
    const { matchId, receiverId, message } = data
    
    // Send to receiver if online
    const receiverSocket = connections.get(receiverId)
    if (receiverSocket) {
      receiverSocket.emit("receive_message", {
        matchId,
        message,
        senderId: userId
      })
    }
  })

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { matchId, receiverId } = data
    const receiverSocket = connections.get(receiverId)
    if (receiverSocket) {
      receiverSocket.emit("user_typing", {
        matchId,
        userId
      })
    }
  })

  // Handle stop typing
  socket.on("stop_typing", (data) => {
    const { matchId, receiverId } = data
    const receiverSocket = connections.get(receiverId)
    if (receiverSocket) {
      receiverSocket.emit("user_stop_typing", {
        matchId,
        userId
      })
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    connections.delete(userId)
  })
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