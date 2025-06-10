Pre-deployment Security Checklist:

1. Environment Variables:
   - [ ] NEXTAUTH_SECRET set (use `openssl rand -base64 32`)
   - [ ] NEXTAUTH_URL set to production URL
   - [ ] DATABASE_URL configured with SSL
   - [ ] DB_CA_CERT added for production

2. Database:
   - [ ] SSL/TLS enabled
   - [ ] Connection pool properly configured
   - [ ] Backups configured

3. Security:
   - [ ] Rate limiting active
   - [ ] Security headers configured
   - [ ] CSRF protection enabled
   - [ ] SSL/TLS certificates valid
   - [ ] Dependencies updated and audited 