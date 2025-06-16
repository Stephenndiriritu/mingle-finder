#!/bin/bash

# Mingle Finder VPS Deployment Script
# Run this script on your VPS to pull and deploy the latest code
# Usage: ./vps-deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🚀 Mingle Finder VPS Deployment Script"
echo "======================================="

# Configuration
APP_DIR="/var/www/mingle-finder"
REPO_URL="https://github.com/Stephenndiriritu/mingle-finder.git"
BRANCH="main"
PM2_APP_NAME="mingle-finder"

# Check if we're in the right directory
if [ "$PWD" != "$APP_DIR" ]; then
    print_warning "Not in app directory. Changing to $APP_DIR"
    cd $APP_DIR
fi

print_step "1. Checking current directory: $(pwd)"

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_step "2. Initializing Git repository..."
    git init
    git remote add origin $REPO_URL
else
    print_step "2. Git repository already initialized"
    # Update remote URL if needed
    git remote set-url origin $REPO_URL
fi

# Backup current .env.production if it exists
if [ -f ".env.production" ]; then
    print_step "3. Backing up environment file..."
    cp .env.production .env.production.backup
    print_status "Environment file backed up to .env.production.backup"
else
    print_warning "No .env.production file found. You'll need to create one after deployment."
fi

# Stop PM2 application if running
print_step "4. Stopping application..."
if pm2 list | grep -q $PM2_APP_NAME; then
    pm2 stop $PM2_APP_NAME
    print_status "Application stopped"
else
    print_warning "Application not running in PM2"
fi

# Pull latest code
print_step "5. Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/$BRANCH
print_status "Code updated successfully"

# Restore environment file
if [ -f ".env.production.backup" ]; then
    print_step "6. Restoring environment file..."
    cp .env.production.backup .env.production
    print_status "Environment file restored"
fi

# Install/update dependencies
print_step "7. Installing dependencies..."
npm install --production
print_status "Dependencies installed"

# Build application
print_step "8. Building application..."
npm run build
print_status "Application built successfully"

# Create necessary directories
print_step "9. Creating necessary directories..."
mkdir -p logs
mkdir -p public/uploads
chmod 755 public/uploads
print_status "Directories created"

# Start application with PM2
print_step "10. Starting application..."
if pm2 list | grep -q $PM2_APP_NAME; then
    pm2 restart $PM2_APP_NAME
    print_status "Application restarted"
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    print_status "Application started"
fi

# Check application status
print_step "11. Checking application status..."
sleep 3
pm2 status

# Test if application is responding
print_step "12. Testing application..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Application is responding on port 3000"
else
    print_error "❌ Application is not responding. Check logs with: pm2 logs $PM2_APP_NAME"
fi

# Show logs
print_step "13. Recent application logs:"
pm2 logs $PM2_APP_NAME --lines 10

echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
print_warning "Important reminders:"
echo "1. Make sure your .env.production file has all required variables"
echo "2. Check that your domain points to this server"
echo "3. Ensure SSL certificate is configured"
echo "4. Monitor logs with: pm2 logs $PM2_APP_NAME"
echo ""
print_status "Useful commands:"
echo "- View logs: pm2 logs $PM2_APP_NAME"
echo "- Restart app: pm2 restart $PM2_APP_NAME"
echo "- Check status: pm2 status"
echo "- Monitor: pm2 monit"
