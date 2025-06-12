#!/usr/bin/env tsx

import pool from '../lib/db'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

async function resetDatabase() {
  console.log('🗑️  Resetting database...\n')

  try {
    // Drop all tables
    console.log('Dropping existing tables...')
    await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `)
    console.log('✅ All tables dropped\n')

    // Run migrations from scratch
    console.log('Running migrations from scratch...')
    
    const migrationsDir = join(process.cwd(), 'database', 'migrations')
    const migrationFiles = await readdir(migrationsDir)
    const sortedMigrations = migrationFiles
      .filter(file => file.endsWith('.sql'))
      .sort()

    for (const file of sortedMigrations) {
      console.log(`Running migration: ${file}`)
      const migrationPath = join(migrationsDir, file)
      const migrationSQL = await readFile(migrationPath, 'utf-8')
      
      try {
        await pool.query(migrationSQL)
        console.log(`✅ ${file} completed successfully`)
      } catch (error) {
        console.error(`❌ Error running migration ${file}:`, error)
        throw error
      }
    }

    console.log('\n🎉 Database reset completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run: npm run create-test-users (optional)')
    console.log('2. Start your application: npm run dev')

  } catch (error) {
    console.error('❌ Database reset failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the reset
resetDatabase()
