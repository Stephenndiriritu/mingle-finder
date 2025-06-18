# 🗄️ Database Setup Guide for Mingle Finder

## 🎯 **Overview**

This guide will help you set up PostgreSQL database for your Mingle Finder app with complete schema including:

- ✅ **User Management** - Authentication and profiles
- ✅ **Matching System** - Swipes, matches, and preferences
- ✅ **Messaging System** - Real-time chat functionality
- ✅ **Payment System** - Subscriptions and transactions
- ✅ **Admin Features** - User management and analytics

## 🚀 **Option 1: Local Development Setup**

### **1.1 Install PostgreSQL**

#### **On Ubuntu/Debian:**
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **On CentOS/RHEL:**
```bash
# Install PostgreSQL
sudo yum install postgresql-server postgresql-contrib

# Initialize database
sudo postgresql-setup initdb

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **On macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

#### **On Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and follow setup wizard
3. Remember the password you set for `postgres` user

### **1.2 Configure PostgreSQL**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database user
CREATE USER minglefinder WITH PASSWORD 'your_secure_password';

# Create database
CREATE DATABASE minglefinder OWNER minglefinder;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE minglefinder TO minglefinder;

# Exit PostgreSQL
\q
```

### **1.3 Update Connection Settings**

Edit PostgreSQL configuration:

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf

# Find and update:
listen_addresses = 'localhost'
port = 5432

# Edit pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Add line for local connections:
local   minglefinder    minglefinder                    md5
host    minglefinder    minglefinder    127.0.0.1/32    md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## 🌐 **Option 2: Cloud Database Setup**

### **2.1 Supabase (Recommended - Free Tier)**

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Create new organization and project
4. Choose region closest to your users
5. Set database password
6. Wait for setup to complete
7. Go to **Settings** → **Database**
8. Copy connection string

### **2.2 Neon (Serverless PostgreSQL)**

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create new project
3. Choose region
4. Copy connection details
5. Database URL format: `postgresql://username:password@host/database`

### **2.3 Railway**

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection URL from variables

### **2.4 Heroku Postgres**

1. Create Heroku app
2. Add Heroku Postgres addon
3. Get DATABASE_URL from config vars

## 📊 **Step 3: Database Schema Setup**

### **3.1 Using Automated Scripts**

Your Mingle Finder app includes automated setup scripts:

```bash
# Navigate to your project directory
cd /path/to/mingle-finder

# Install dependencies (if not done)
npm install

# Set up database (creates tables and initial data)
npm run setup-db

# Run migrations (applies schema updates)
npm run migrate

# Seed database with sample data (optional)
npm run seed
```

### **3.2 Manual Schema Setup**

If you prefer manual setup, run this SQL:

```sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    subscription_type VARCHAR(50) DEFAULT 'free',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    age INTEGER,
    gender VARCHAR(20),
    location VARCHAR(255),
    interests TEXT[],
    photos TEXT[],
    height INTEGER,
    occupation VARCHAR(255),
    education VARCHAR(255),
    looking_for VARCHAR(20),
    max_distance INTEGER DEFAULT 50,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 99,
    show_me VARCHAR(20) DEFAULT 'everyone',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create swipes table
CREATE TABLE swipes (
    id SERIAL PRIMARY KEY,
    swiper_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    swiped_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_id, swiped_id)
);

-- Create matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user1_id, user2_id)
);

-- Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reported_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create blocks table
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_swipes_swiper_swiped ON swipes(swiper_id, swiped_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

## 🔧 **Step 4: Environment Configuration**

### **4.1 Local Development**

Create `.env.local` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://minglefinder:your_secure_password@localhost:5432/minglefinder

# Authentication
JWT_SECRET=your_jwt_secret_key_min_32_characters_long

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### **4.2 Production Environment**

Add to your deployment platform:

```bash
# Production Database (replace with your actual values)
DATABASE_URL=postgresql://username:password@your-db-host:5432/minglefinder

# Authentication
JWT_SECRET=your_production_jwt_secret_key_min_32_characters_long

# App Configuration
NEXT_PUBLIC_APP_URL=https://minglefinder.com
NODE_ENV=production
```

## 🧪 **Step 5: Test Database Connection**

### **5.1 Test Connection Script**

```bash
# Test database connection
npm run inspect-db

# Expected output:
# ✅ Database connection successful
# ✅ All tables exist
# ✅ Indexes created
```

### **5.2 Create Admin User**

```bash
# Create admin user for testing
npm run create-admin

# Follow prompts to create admin account
```

### **5.3 Create Test Users**

```bash
# Create sample users for testing
npm run create-test-users

# This creates 10 sample users with profiles
```

## 📊 **Step 6: Database Management**

### **6.1 Backup Database**

```bash
# Local backup
pg_dump -U minglefinder -h localhost minglefinder > backup.sql

# Restore from backup
psql -U minglefinder -h localhost minglefinder < backup.sql
```

### **6.2 Reset Database**

```bash
# Reset entire database (WARNING: Deletes all data)
npm run reset-db

# This will:
# 1. Drop all tables
# 2. Recreate schema
# 3. Add sample data
```

### **6.3 Database Migrations**

```bash
# Run pending migrations
npm run migrate

# Check migration status
npm run inspect-db
```

## 🔍 **Step 7: Verify Setup**

### **7.1 Check Tables**

Connect to your database and verify:

```sql
-- List all tables
\dt

-- Check users table
SELECT COUNT(*) FROM users;

-- Check profiles table
SELECT COUNT(*) FROM profiles;

-- Verify admin user exists
SELECT email, is_admin FROM users WHERE is_admin = true;
```

### **7.2 Test App Connection**

1. Start your app: `npm run dev`
2. Go to `/admin/debug`
3. Check database connection status
4. Verify all tables are listed

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Connection refused**:
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Start if not running
   sudo systemctl start postgresql
   ```

2. **Authentication failed**:
   - Check username/password in DATABASE_URL
   - Verify user exists in PostgreSQL
   - Check pg_hba.conf settings

3. **Database doesn't exist**:
   ```sql
   -- Create database manually
   CREATE DATABASE minglefinder;
   ```

4. **Permission denied**:
   ```sql
   -- Grant permissions
   GRANT ALL PRIVILEGES ON DATABASE minglefinder TO minglefinder;
   ```

## 🎯 **Production Recommendations**

### **Security:**
- Use strong passwords (20+ characters)
- Enable SSL connections
- Restrict database access by IP
- Regular security updates

### **Performance:**
- Set up connection pooling
- Monitor query performance
- Regular VACUUM and ANALYZE
- Proper indexing strategy

### **Backup:**
- Daily automated backups
- Test restore procedures
- Multiple backup locations
- Point-in-time recovery setup

## ✅ **Success Checklist**

- [ ] PostgreSQL installed and running
- [ ] Database and user created
- [ ] Schema tables created successfully
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Admin user created
- [ ] Sample data loaded (optional)
- [ ] App connects successfully

## 🎉 **Congratulations!**

Your Mingle Finder database is now set up and ready! Your app can now:

- ✅ **Store user accounts** and profiles
- ✅ **Track swipes and matches**
- ✅ **Handle real-time messaging**
- ✅ **Manage subscriptions** and payments
- ✅ **Store notifications** and reports
- ✅ **Support admin features**

**Your dating app database is production-ready!** 🗄️💕

## 🌟 **Advanced Configuration**

### **Connection Pooling**

For production, set up connection pooling:

```javascript
// lib/db.ts - Enhanced connection pool
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
})

export default pool
```

### **Database Monitoring**

Monitor your database performance:

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT pg_size_pretty(pg_database_size('minglefinder'));

-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🔐 **Security Best Practices**

### **Database Security Checklist:**

- [ ] **Strong passwords** (20+ characters, mixed case, numbers, symbols)
- [ ] **SSL/TLS encryption** for all connections
- [ ] **Firewall rules** restricting database access
- [ ] **Regular security updates** for PostgreSQL
- [ ] **Database user permissions** (principle of least privilege)
- [ ] **Audit logging** enabled
- [ ] **Backup encryption** for sensitive data

### **Production Security Settings:**

```sql
-- Create read-only user for analytics
CREATE USER analytics_readonly WITH PASSWORD 'secure_readonly_password';
GRANT CONNECT ON DATABASE minglefinder TO analytics_readonly;
GRANT USAGE ON SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;

-- Create backup user
CREATE USER backup_user WITH PASSWORD 'secure_backup_password';
GRANT CONNECT ON DATABASE minglefinder TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
```

## 📈 **Performance Optimization**

### **Essential Indexes:**

```sql
-- Additional performance indexes
CREATE INDEX CONCURRENTLY idx_users_subscription_active ON users(subscription_type) WHERE subscription_type != 'free';
CREATE INDEX CONCURRENTLY idx_profiles_location_age ON profiles(location, age);
CREATE INDEX CONCURRENTLY idx_swipes_created_at ON swipes(created_at);
CREATE INDEX CONCURRENTLY idx_matches_active ON matches(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX CONCURRENTLY idx_notifications_unread ON notifications(user_id, created_at) WHERE is_read = false;
```

### **Query Optimization:**

```sql
-- Analyze table statistics
ANALYZE users;
ANALYZE profiles;
ANALYZE swipes;
ANALYZE matches;
ANALYZE messages;

-- Update table statistics automatically
ALTER TABLE users SET (autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE messages SET (autovacuum_analyze_scale_factor = 0.02);
```

## 🔄 **Backup and Recovery**

### **Automated Backup Script:**

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/minglefinder"
DB_NAME="minglefinder"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U minglefinder -d $DB_NAME | gzip > $BACKUP_DIR/minglefinder_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "minglefinder_*.sql.gz" -mtime +7 -delete

echo "Backup completed: minglefinder_$DATE.sql.gz"
```

### **Set up Cron Job:**

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-database.sh
```

## 🌐 **Cloud Database Specific Setup**

### **Supabase Configuration:**

```bash
# Environment variables for Supabase
DATABASE_URL=postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres
SUPABASE_URL=https://your_project_ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Neon Configuration:**

```bash
# Environment variables for Neon
DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb
NEON_BRANCH_ID=br_cool_darkness_123456
NEON_PROJECT_ID=cool-darkness-123456
```

### **Railway Configuration:**

```bash
# Railway automatically provides
DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway
RAILWAY_ENVIRONMENT=production
```

## 🧪 **Testing and Development**

### **Test Database Setup:**

```bash
# Create separate test database
createdb minglefinder_test

# Run tests with test database
DATABASE_URL=postgresql://minglefinder:password@localhost:5432/minglefinder_test npm test
```

### **Development Data Seeding:**

```sql
-- Insert sample admin user
INSERT INTO users (email, password_hash, name, is_admin, is_verified)
VALUES ('admin@minglefinder.com', '$2b$10$hash', 'Admin User', true, true);

-- Insert sample regular users
INSERT INTO users (email, password_hash, name, is_verified) VALUES
('john@example.com', '$2b$10$hash', 'John Doe', true),
('jane@example.com', '$2b$10$hash', 'Jane Smith', true),
('mike@example.com', '$2b$10$hash', 'Mike Johnson', true);

-- Insert sample profiles
INSERT INTO profiles (user_id, first_name, last_name, bio, age, gender, location) VALUES
(2, 'John', 'Doe', 'Love hiking and coffee', 28, 'male', 'New York, NY'),
(3, 'Jane', 'Smith', 'Yoga instructor and book lover', 26, 'female', 'Los Angeles, CA'),
(4, 'Mike', 'Johnson', 'Software engineer and gamer', 30, 'male', 'San Francisco, CA');
```

## 📱 **Mobile App Considerations**

### **Offline Support:**

```sql
-- Add sync columns for offline support
ALTER TABLE messages ADD COLUMN sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE swipes ADD COLUMN sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE matches ADD COLUMN sync_status VARCHAR(20) DEFAULT 'synced';

-- Create sync tracking table
CREATE TABLE sync_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    table_name VARCHAR(50),
    record_id INTEGER,
    action VARCHAR(20),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 **Final Verification**

### **Complete System Test:**

```bash
# 1. Test database connection
npm run inspect-db

# 2. Create test admin
npm run create-admin

# 3. Start application
npm run dev

# 4. Test endpoints
curl http://localhost:3000/api/auth/status
curl http://localhost:3000/api/users

# 5. Check admin panel
# Visit: http://localhost:3000/admin/debug
```

### **Production Readiness Checklist:**

- [ ] Database server properly configured
- [ ] SSL/TLS encryption enabled
- [ ] Connection pooling configured
- [ ] Backup system automated
- [ ] Monitoring and alerting set up
- [ ] Performance indexes created
- [ ] Security hardening applied
- [ ] Environment variables secured
- [ ] Admin user created
- [ ] Application connects successfully

**Your Mingle Finder database is now enterprise-ready for production deployment!** 🚀💕
