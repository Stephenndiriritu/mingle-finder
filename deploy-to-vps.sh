#!/bin/bash

# Mingle Finder VPS Deployment Script
# Usage: ./deploy-to-vps.sh

set -e

echo "🚀 Mingle Finder VPS Deployment Script"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js version: $NODE_VERSION"
print_status "NPM version: $NPM_VERSION"

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/mingle-finder
sudo chown $USER:$USER /var/www/mingle-finder

print_status "✅ Basic server setup completed!"
echo ""
print_warning "Next steps:"
echo "1. Clone your repository to /var/www/mingle-finder"
echo "2. Set up PostgreSQL database and user"
echo "3. Configure environment variables"
echo "4. Build and deploy the application"
echo ""
print_status "See VPS_DEPLOYMENT_GUIDE.md for detailed instructions"

# Prompt for database setup
read -p "Do you want to set up the database now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Setting up PostgreSQL database..."
    
    read -p "Enter database password for 'mingleuser': " -s DB_PASSWORD
    echo
    
    sudo -u postgres psql << EOF
CREATE DATABASE minglefinder;
CREATE USER mingleuser WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE minglefinder TO mingleuser;
ALTER USER mingleuser CREATEDB;
\q
EOF
    
    print_status "✅ Database setup completed!"
    print_warning "Remember to use this password in your .env.production file"
fi

echo ""
print_status "🎉 VPS setup completed successfully!"
print_status "Your server is ready for Mingle Finder deployment"
