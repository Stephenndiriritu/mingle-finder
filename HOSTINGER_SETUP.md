# 🚀 Mingle Finder - Hostinger Deployment Guide

## Quick Setup Steps

### 1. Download and Prepare Files
1. Download this code project
2. Extract all files to a folder
3. Copy `.env.example` to `.env.local`
4. Edit `.env.local` with your database details

### 2. Set Up Database on Hostinger
1. Go to Hostinger control panel
2. Navigate to "Databases" → "PostgreSQL"
3. Create new database: `mingle_finder`
4. Note: hostname, username, password, port
5. Connect to database and run `database-schema.sql`

### 3. Configure Environment Variables
Edit `.env.local`:
\`\`\`env
DATABASE_URL=postgresql://username:password@hostname:port/mingle_finder
JWT_SECRET=your-32-character-secret-key-here
NEXTAUTH_SECRET=another-secret-key-here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
\`\`\`

### 4. Upload to Hostinger
1. Build the application locally:
   \`\`\`bash
   npm install
   npm run build
   \`\`\`
2. Upload these files/folders to your domain folder:
   - All source files
   - `.next` folder (after build)
   - `node_modules` folder
   - `package.json`
   - `server.js`
   - `.env.local`

### 5. Configure Node.js in Hostinger
1. Go to "Node.js" in control panel
2. Set Node.js version: 18.x or higher
3. Set startup file: `server.js`
4. Add environment variables from your `.env.local`
5. Click "Start Application"

### 6. Test Your Application
- Visit your domain
- Try registering a new user
- Test login/logout
- Check admin panel at `/admin`

## Default Admin Login
- Email: `admin@minglefinder.com`
- Password: `admin123`
- **⚠️ Change this immediately after deployment!**

## Troubleshooting

### Application Won't Start
- Check Node.js version (18+)
- Verify `server.js` exists
- Check environment variables
- Review error logs in Hostinger panel

### Database Connection Error
- Verify DATABASE_URL format
- Check database credentials
- Ensure database exists
- Test connection manually

### 500 Error
- Check application logs
- Verify all files uploaded
- Ensure environment variables are set
- Check file permissions

## Features Included
✅ User registration and authentication
✅ Profile creation and editing
✅ Swipe-based matching
✅ Real-time messaging
✅ Admin panel
✅ Responsive design
✅ Database optimization

## Need Help?
If you encounter any issues:
1. Check Hostinger error logs
2. Verify all environment variables
3. Ensure database schema is properly installed
4. Test database connection

Your Mingle Finder app should now be live! 🎉
