import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import pool from "./db"

interface SocketUser {
  id: number
  name: string
  isAdmin: boolean
}

export class SocketService {
  private io: SocketIOServer
  private static instance: SocketService
  private connectedUsers: Map<string, SocketUser> = new Map()

  private constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ['GET', 'POST']
      }
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        // Get user ID from auth data
        const userId = socket.handshake.auth.userId
        
        if (!userId) {
          return next(new Error('Unauthorized'))
        }
        
        // Verify user exists in database
        const result = await pool.query(
          "SELECT id, name, is_admin FROM users WHERE id = $1 AND is_active = true",
          [userId]
        )
        
        if (result.rows.length === 0) {
          return next(new Error('User not found'))
        }
        
        const user = result.rows[0]
        socket.data.user = {
          id: user.id,
          name: user.name,
          isAdmin: user.is_admin
        }
        
        next()
      } catch (error) {
        next(new Error('Authentication failed'))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user as SocketUser
      
      // Store connected user
      this.connectedUsers.set(socket.id, user)
      
      console.log(`User connected: ${user.name} (${user.id})`)
      
      // Handle disconnect
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id)
        console.log(`User disconnected: ${user.name} (${user.id})`)
      })
      
      // Handle sending messages
      socket.on('send_message', async (data, callback) => {
        try {
          const { match_id, receiver_id, message } = data
          
          // Validate data
          if (!match_id || !receiver_id || !message) {
            return callback({ error: 'Invalid message data' })
          }
          
          // Save message to database
          const result = await pool.query(
            `INSERT INTO messages (match_id, sender_id, receiver_id, message)
             VALUES ($1, $2, $3, $4)
             RETURNING id, match_id, sender_id, receiver_id, message, created_at, is_read`,
            [match_id, user.id, receiver_id, message]
          )
          
          const savedMessage = result.rows[0]
          
          // Emit to receiver if online
          this.io.sockets.sockets.forEach(s => {
            const socketUser = s.data.user as SocketUser
            if (socketUser && socketUser.id === receiver_id) {
              s.emit('new_message', savedMessage)
            }
          })
          
          // Return saved message to sender
          callback({ message: savedMessage })
        } catch (error) {
          console.error('Error sending message:', error)
          callback({ error: 'Failed to send message' })
        }
      })
      
      // Handle typing indicators
      socket.on('typing', (data) => {
        const { match_id, isTyping } = data
        
        if (!match_id) return
        
        // Find receiver sockets and emit typing event
        this.io.sockets.sockets.forEach(s => {
          const socketUser = s.data.user as SocketUser
          if (socketUser && socketUser.id !== user.id) {
            s.emit('typing', {
              match_id,
              user_id: user.id,
              isTyping
            })
          }
        })
      })
    })
  }

  public static getInstance(server?: HTTPServer): SocketService {
    if (!SocketService.instance && server) {
      SocketService.instance = new SocketService(server)
    }
    
    if (!SocketService.instance) {
      throw new Error('Socket service not initialized')
    }
    
    return SocketService.instance
  }

  public getIO(): SocketIOServer {
    return this.io
  }

  public getConnectedUsers(): Map<string, SocketUser> {
    return this.connectedUsers
  }
}

export default SocketService

