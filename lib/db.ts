import { Pool, PoolClient } from 'pg'

// Declare global types to extend the NodeJS global object
declare global {
  var pgPool: Pool | undefined
}

// Define a more specific type for the error handler
type PoolErrorHandler = (err: Error) => void;

let pool: Pool

// Create a new pool if one doesn't exist
if (!global.pgPool) {
  // Use environment variable or fallback to default connection string
  const connectionString = process.env.DATABASE_URL || "postgres://postgres:1234@localhost:5432/minglefinder"

  // Create a real pool
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  // Log when a new pool is created
  console.log('DB pool connection created')

  // Add error handler with explicit type casting
  pool.on('error', ((err: Error) => {
    console.error('Unexpected error on idle client', err)
  }) as PoolErrorHandler)

  // Store in global object
  global.pgPool = pool
} else {
  // Reuse existing pool
  pool = global.pgPool
}

export default pool

// Export async database functions
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`Slow query (${duration}ms): ${text}`)
    }
    
    return result
  } catch (error: unknown) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect()
  return client
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error: unknown) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}





