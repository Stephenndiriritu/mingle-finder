import { Pool } from "pg"

function validateDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return url
}

// Pool configuration
const POOL_CONFIG = {
  max: Number.parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
  min: Number.parseInt(process.env.DB_MIN_CONNECTIONS || "2"),
  idleTimeoutMillis: Number.parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
  connectionTimeoutMillis: 2000,
  statement_timeout: 10000, // 10 seconds
  query_timeout: 5000, // 5 seconds
  application_name: "minglefinder",
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
}

let pool: Pool

try {
  const databaseUrl = validateDatabaseUrl(process.env.DATABASE_URL)
  
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    ...POOL_CONFIG
  })

  // Event listeners for pool management
  pool.on("connect", (client: import("pg").PoolClient) => {
    client.query(`SET application_name = '${POOL_CONFIG.application_name}'`)
    console.log("✅ New database connection established")
  })

  pool.on("acquire", () => {
    console.debug("🔄 Connection acquired from pool")
  })

  pool.on("remove", () => {
    console.debug("🔄 Connection removed from pool")
  })

  pool.on("error", (err: Error) => {
    console.error("❌ Database pool error:", err)
  })

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 Closing database pool...")
    pool.end().then(() => {
      console.log("✅ Database pool closed")
      process.exit(0)
    })
  })

} catch (error) {
  console.error("❌ Failed to create database pool:", error)
  
  if (process.env.NODE_ENV === "development") {
    pool = {
      query: async (text: string, params?: any[]) => {
        console.log("🔧 Mock database query:", { text, params })
        return { rows: [], rowCount: 0 }
      },
      connect: async () => ({
        query: async () => ({ rows: [], rowCount: 0 }),
        release: () => {},
      }),
    } as any
  } else {
    throw new Error("Database connection failed. Please check your configuration.")
  }
}

// Helper function for transactions
export async function withTransaction<T>(callback: (client: import("pg").PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export default pool
