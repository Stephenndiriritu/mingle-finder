const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://minglefinder:secure_password_123@localhost:5432/minglefinder'
});

async function createTestUser() {
  try {
    // Hash the password 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    console.log('🔐 Creating test user...');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    // Insert test user
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name, is_verified, is_active, subscription_type, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        is_verified = EXCLUDED.is_verified,
        is_active = EXCLUDED.is_active
      RETURNING id, email, name
    `, [
      'test@example.com',
      hashedPassword,
      'Test User',
      true,
      true,
      'free',
      false
    ]);
    
    const user = result.rows[0];
    console.log('✅ Test user created/updated:', user);
    
    // Also create an admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const adminResult = await pool.query(`
      INSERT INTO users (email, password_hash, name, is_verified, is_active, subscription_type, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        is_verified = EXCLUDED.is_verified,
        is_active = EXCLUDED.is_active,
        is_admin = EXCLUDED.is_admin
      RETURNING id, email, name, is_admin
    `, [
      'admin@minglefinder.com',
      adminPassword,
      'Admin User',
      true,
      true,
      'premium',
      true
    ]);
    
    const admin = adminResult.rows[0];
    console.log('✅ Admin user created/updated:', admin);
    
    console.log('\n🎯 Test these credentials:');
    console.log('Regular User:');
    console.log('  Email: test@example.com');
    console.log('  Password: password123');
    console.log('\nAdmin User:');
    console.log('  Email: admin@minglefinder.com');
    console.log('  Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
