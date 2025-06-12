#!/usr/bin/env tsx

import pool from '../lib/db'

async function inspectDatabase() {
  console.log('🔍 Inspecting database structure...\n')

  try {
    // Check if database connection works
    console.log('Testing database connection...')
    const connectionTest = await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful\n')

    // List all tables
    console.log('📋 Tables in database:')
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in database')
      return
    }

    for (const row of tablesResult.rows) {
      console.log(`  - ${row.table_name}`)
    }
    console.log('')

    // Check users table structure
    console.log('👤 Users table structure:')
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `)
    
    if (usersColumns.rows.length > 0) {
      for (const col of usersColumns.rows) {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
      }
    } else {
      console.log('  ❌ Users table not found')
    }
    console.log('')

    // Check profiles table structure
    console.log('📝 Profiles table structure:')
    const profilesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      ORDER BY ordinal_position
    `)
    
    if (profilesColumns.rows.length > 0) {
      for (const col of profilesColumns.rows) {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
      }
    } else {
      console.log('  ❌ Profiles table not found')
    }
    console.log('')

    // Check payment_orders table structure
    console.log('💳 Payment_orders table structure:')
    const paymentColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payment_orders' 
      ORDER BY ordinal_position
    `)
    
    if (paymentColumns.rows.length > 0) {
      for (const col of paymentColumns.rows) {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
      }
    } else {
      console.log('  ❌ Payment_orders table not found')
    }
    console.log('')

    // Count records in main tables
    console.log('📊 Record counts:')
    try {
      const userCount = await pool.query('SELECT COUNT(*) FROM users')
      console.log(`  - Users: ${userCount.rows[0].count}`)
    } catch (e) {
      console.log('  - Users: Table not accessible')
    }

    try {
      const profileCount = await pool.query('SELECT COUNT(*) FROM profiles')
      console.log(`  - Profiles: ${profileCount.rows[0].count}`)
    } catch (e) {
      console.log('  - Profiles: Table not accessible')
    }

    try {
      const paymentCount = await pool.query('SELECT COUNT(*) FROM payment_orders')
      console.log(`  - Payment Orders: ${paymentCount.rows[0].count}`)
    } catch (e) {
      console.log('  - Payment Orders: Table not accessible')
    }

    console.log('\n✅ Database inspection completed!')

  } catch (error) {
    console.error('❌ Database inspection failed:', error)
  } finally {
    await pool.end()
  }
}

// Run the inspection
inspectDatabase()
