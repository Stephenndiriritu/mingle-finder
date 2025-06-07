# Mingle Finder Production Setup Guide

## Environment Setup

1. Create a `.env` file in your root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/mingle_finder
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=mingle_finder

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-32-char-secret-key
JWT_SECRET=your-jwt-secret-key

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@your-domain.com

# Storage Configuration
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
MAX_FILES_PER_USER=10

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# WebSocket Configuration
SOCKET_PORT=3001

# Optional: External Services

# Environment
NODE_ENV=production
```

## Production Deployment Steps

1. Install dependencies:
```bash
npm install --production
```

2. Build the application:
```bash
npm run build
```

3. Database Setup:
   - Ensure PostgreSQL is installed and running
   - Create the database: `createdb mingle_finder`
   - Run migrations (if using any)

4. File Storage:
   - Create uploads directory: `mkdir -p public/uploads`
   - Set proper permissions: `chmod 755 public/uploads`

5. SSL/TLS Setup:
   - Obtain SSL certificate for your domain
   - Configure reverse proxy (nginx/apache) with SSL

6. Start the application:
```bash
npm run start
```

## Security Considerations

1. **Environment Variables**:
   - Never commit `.env` file to version control
   - Use different secrets for development and production
   - Regularly rotate sensitive credentials

2. **File Uploads**:
   - Configure maximum file size limits in nginx/apache
   - Implement virus scanning for uploaded files
   - Set up CDN for serving static files

3. **Rate Limiting**:
   - Configure rate limiting at nginx/apache level
   - Monitor and adjust limits based on usage

4. **Database**:
   - Regular backups
   - Use connection pooling
   - Set up read replicas for scaling

## Monitoring and Maintenance

1. **Logging**:
   - Set up application logging
   - Monitor error rates and performance
   - Use services like Sentry for error tracking

2. **Performance**:
   - Enable compression
   - Configure caching headers
   - Use CDN for static assets

3. **Backup**:
   - Regular database backups
   - Backup uploaded files
   - Test restore procedures

## Scaling Considerations

1. **Horizontal Scaling**:
   - Use load balancer
   - Configure session persistence
   - Set up multiple app instances

2. **Database Scaling**:
   - Connection pooling
   - Read replicas
   - Proper indexing

3. **File Storage**:
   - Consider using S3 or similar for file storage
   - CDN for file delivery

## Recommended Production Stack

- **Web Server**: Nginx
- **Process Manager**: PM2
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis
- **CDN**: Cloudflare/AWS CloudFront
- **Monitoring**: PM2/New Relic/Datadog
- **Error Tracking**: Sentry
- **SSL**: Let's Encrypt
- **Storage**: AWS S3 (optional)

## Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring tools set up
- [ ] Rate limiting configured
- [ ] File upload limits set
- [ ] Security headers configured
- [ ] Error tracking enabled
- [ ] Performance monitoring enabled
- [ ] Backup procedures tested 