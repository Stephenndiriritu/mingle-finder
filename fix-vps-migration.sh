#!/bin/bash

# Quick fix for VPS migration issue
# Run this on your VPS to fix the database migration error

echo "🔧 Fixing VPS database migration issue..."

# Navigate to app directory
cd /var/www/mingle-finder

# Pull latest changes with the fix
echo "📥 Pulling latest changes..."
git pull origin master

# First, let's inspect the current database structure
echo "🔍 Inspecting current database structure..."
npm run inspect-db

echo ""
echo "🔄 Attempting to run migrations again..."
npm run migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
    echo "🚀 Starting application..."
    pm2 restart mingle-finder
    echo "✅ Application restarted!"
else
    echo "❌ Migrations still failing. Trying database reset..."
    
    # Option 2: Reset database if migrations still fail
    read -p "Do you want to reset the database? This will delete all data. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Resetting database..."
        npm run reset-db
        
        if [ $? -eq 0 ]; then
            echo "✅ Database reset successful!"
            echo "🚀 Starting application..."
            pm2 restart mingle-finder
            echo "✅ Application restarted!"
        else
            echo "❌ Database reset failed. Manual intervention required."
            exit 1
        fi
    else
        echo "❌ Migration fix cancelled. Please check the error logs."
        exit 1
    fi
fi

echo ""
echo "🎉 VPS migration issue fixed!"
echo "📍 Your app should now be running at your domain"
echo ""
echo "Next steps:"
echo "1. Test the application in your browser"
echo "2. Check PayPal integration works"
echo "3. Create test users if needed: npm run create-test-users"
