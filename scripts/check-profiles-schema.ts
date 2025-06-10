import pool from '../lib/db'

async function checkProfilesSchema() {
  try {
    console.log('Checking reports table schema...')

    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'reports' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)

    console.log('Reports table columns:')
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })

  } catch (error) {
    console.error('Error checking schema:', error)
  } finally {
    await pool.end()
  }
}

checkProfilesSchema()
