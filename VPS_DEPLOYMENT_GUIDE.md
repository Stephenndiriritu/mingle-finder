# 🚀 VPS Deployment Guide for Mingle Finder

## Prerequisites

- Ubuntu/Debian VPS with root access
- Domain name pointed to your VPS IP
- At least 2GB RAM, 20GB storage
- Basic knowledge of Linux commands

## 📋 Deployment Checklist

### Phase 1: Server Setup
- [ ] Update system packages
- [ ] Install Node.js 18+
- [ ] Install PostgreSQL
- [ ] Install Nginx
- [ ] Configure firewall
- [ ] Set up SSL certificate

### Phase 2: Application Setup
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up database
- [ ] Build application
- [ ] Configure process manager

### Phase 3: Production Configuration
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL/HTTPS
- [ ] Configure PayPal for production
- [ ] Set up monitoring
- [ ] Configure backups

## 🛠 Step-by-Step Instructions

### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE minglefinder;
CREATE USER mingleuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE minglefinder TO mingleuser;
ALTER USER mingleuser CREATEDB;
\q
EOF
```

### Step 3: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable
```

### Step 4: Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/mingle-finder
sudo chown $USER:$USER /var/www/mingle-finder

# Clone repository (replace with your GitHub URL)
cd /var/www/mingle-finder
git clone https://github.com/YOUR_USERNAME/mingle-finder.git .

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 5: Configure Environment Variables

```bash
# Create production environment file
nano .env.production

# Add these variables (replace with your actual values):
```

```env
# =================================================================
# PRODUCTION ENVIRONMENT VARIABLES
# =================================================================

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
PORT=3000

# Database
DATABASE_URL=postgresql://mingleuser:your_secure_password@localhost:5432/minglefinder

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_very_secure_nextauth_secret_here
JWT_SECRET=your_very_secure_jwt_secret_here

# PayPal Production (replace with live credentials)
PAYPAL_CLIENT_ID=your_live_paypal_client_id
PAYPAL_CLIENT_SECRET=your_live_paypal_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_paypal_client_id
PAYPAL_MODE=live
PAYPAL_WEBHOOK_ID=your_live_webhook_id

# Email (configure with your email service)
SMTP_HOST=smtp.youremailprovider.com
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@yourdomain.com

# Security
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/var/www/mingle-finder/public/uploads
```

### Step 6: Setup Database

```bash
# Run database migrations
npm run migrate

# Optional: Create test users
npm run create-test-users
```

### Step 7: Build and Start Application

```bash
# Build the application
npm run build

# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'mingle-finder',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/mingle-finder',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

```bash
# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 8: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mingle-finder
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # File upload size
    client_max_body_size 10M;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /_next/static {
        alias /var/www/mingle-finder/.next/static;
        expires 365d;
        access_log off;
    }

    # Public files
    location /public {
        alias /var/www/mingle-finder/public;
        expires 30d;
        access_log off;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mingle-finder /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 9: Setup SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔧 Production Considerations

### Security Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Configure firewall properly
- [ ] Set up fail2ban
- [ ] Regular security updates
- [ ] Monitor logs

### Performance Optimization
- [ ] Enable Nginx gzip compression
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Set up CDN for static assets
- [ ] Monitor resource usage

### Monitoring & Maintenance
- [ ] Set up log rotation
- [ ] Configure monitoring (PM2 monitoring)
- [ ] Set up automated backups
- [ ] Configure error tracking
- [ ] Set up uptime monitoring

## 🚨 Important Notes

1. **PayPal Production**: Switch to live PayPal credentials and update webhook URLs
2. **Database Backups**: Set up automated PostgreSQL backups
3. **SSL Certificate**: Auto-renewal is configured with Certbot
4. **Environment Variables**: Never commit production secrets to Git
5. **Updates**: Plan for zero-downtime deployments

## 📞 Support Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs mingle-finder

# Restart application
pm2 restart mingle-finder

# Check Nginx status
sudo systemctl status nginx

# Check database connection
sudo -u postgres psql -d minglefinder -c "SELECT version();"
```

Your VPS deployment is now ready! 🎉
