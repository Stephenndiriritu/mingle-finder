'use server'

import pool from './db'

export async function executeQuery(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`Slow query (${duration}ms): ${text}`)
    }
    
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function beginTransaction() {
  const client = await pool.connect()
  await client.query('BEGIN')
  return client
}

export async function commitTransaction(client: any) {
  await client.query('COMMIT')
  client.release()
}

export async function rollbackTransaction(client: any) {
  await client.query('ROLLBACK')
  client.release()
}