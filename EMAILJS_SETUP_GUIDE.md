# 📧 EmailJS Setup Guide for Mingle Finder

## 🎯 **Overview**

EmailJS allows your Mingle Finder app to send professional emails directly from the frontend without needing a backend email server. This guide will help you set up:

- ✅ **Email Verification** - Account activation emails
- ✅ **Welcome Emails** - User onboarding
- ✅ **Match Notifications** - New match alerts
- ✅ **Message Notifications** - New message alerts
- ✅ **Password Reset** - Secure password recovery
- ✅ **General Notifications** - Custom emails

## 🚀 **Step 1: Create EmailJS Account**

### **1.1 Sign Up**
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"**
3. Create account with your email
4. Verify your email address

### **1.2 Choose Plan**
- **Free Plan**: 200 emails/month (good for testing)
- **Personal Plan**: $15/month, 1,000 emails/month
- **Business Plan**: $35/month, 10,000 emails/month

## 📧 **Step 2: Set Up Email Service**

### **2.1 Add Email Service**
1. In EmailJS dashboard, click **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:

#### **Option A: Gmail (Recommended)**
- Select **"Gmail"**
- Click **"Connect Account"**
- Authorize EmailJS to access your Gmail
- Service ID will be generated (save this!)

#### **Option B: Outlook/Hotmail**
- Select **"Outlook"**
- Enter your Outlook credentials
- Complete authorization

#### **Option C: Custom SMTP**
- Select **"Custom SMTP"**
- Enter your email server details

### **2.2 Save Service ID**
- Copy your **Service ID** (e.g., `service_abc123`)
- You'll need this for environment variables

## 📝 **Step 3: Create Email Templates**

You need to create 6 email templates for your Mingle Finder app:

### **3.1 General Email Template**

1. Click **"Email Templates"** → **"Create New Template"**
2. **Template Name**: `General Email`
3. **Template ID**: `template_general` (or auto-generated)
4. **Email Content**:

```html
Subject: {{subject}}

<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💕 Mingle Finder</h1>
        </div>
        <div class="content">
            {{{message}}}
        </div>
        <div class="footer">
            <p>© 2024 Mingle Finder. All rights reserved.</p>
            <p>Find your perfect match at minglefinder.com</p>
        </div>
    </div>
</body>
</html>
```

### **3.2 Email Verification Template**

1. **Template Name**: `Email Verification`
2. **Template ID**: `template_verification`
3. **Email Content**:

```html
Subject: Verify Your Mingle Finder Account

<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💕 Welcome to Mingle Finder!</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi there!</p>
            <p>Thanks for joining Mingle Finder! To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="{{verification_link}}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>{{verification_link}}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2024 Mingle Finder. All rights reserved.</p>
            <p>Find your perfect match at minglefinder.com</p>
        </div>
    </div>
</body>
</html>
```

### **3.3 Welcome Email Template**

1. **Template Name**: `Welcome Email`
2. **Template ID**: `template_welcome`
3. **Email Content**:

```html
Subject: Welcome to Mingle Finder, {{user_name}}! 💕

<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Mingle Finder!</h1>
        </div>
        <div class="content">
            <h2>Hi {{user_name}}!</h2>
            <p>Welcome to the Mingle Finder community! We're excited to help you find meaningful connections.</p>
            
            <h3>🚀 Get Started:</h3>
            <ul>
                <li>Complete your profile with photos and interests</li>
                <li>Start swiping to discover amazing people</li>
                <li>Upgrade to Premium for unlimited messaging</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="https://minglefinder.com/app/profile" class="button">Complete Profile</a>
                <a href="https://minglefinder.com/app/discover" class="button">Start Swiping</a>
            </div>
            
            <p>Happy matching! 💕</p>
        </div>
        <div class="footer">
            <p>© 2024 Mingle Finder. All rights reserved.</p>
            <p>Find your perfect match at minglefinder.com</p>
        </div>
    </div>
</body>
</html>
```

### **3.4 Match Notification Template**

1. **Template Name**: `Match Notification`
2. **Template ID**: `template_match`
3. **Email Content**:

```html
Subject: 💕 You have a new match on Mingle Finder!

<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💕 It's a Match!</h1>
        </div>
        <div class="content">
            <h2>Congratulations!</h2>
            <p>You and <strong>{{match_name}}</strong> liked each other!</p>
            <p>This is the perfect time to start a conversation and get to know each other better.</p>
            <a href="https://minglefinder.com/app/matches" class="button">Start Chatting</a>
            <p>Don't wait too long - make the first move and say hello! 😊</p>
        </div>
        <div class="footer">
            <p>© 2024 Mingle Finder. All rights reserved.</p>
            <p>Find your perfect match at minglefinder.com</p>
        </div>
    </div>
</body>
</html>
```

### **3.5 Message Notification Template**

1. **Template Name**: `Message Notification`
2. **Template ID**: `template_message`
3. **Email Content**:

```html
Subject: 💬 New message from {{sender_name}} on Mingle Finder

<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 New Message!</h1>
        </div>
        <div class="content">
            <h2>{{sender_name}} sent you a message:</h2>
            <div class="message-box">
                "{{message_preview}}"
            </div>
            <a href="https://minglefinder.com/app/messages" class="button">Reply Now</a>
            <p>Don't keep them waiting - reply and keep the conversation going! 😊</p>
        </div>
        <div class="footer">
            <p>© 2024 Mingle Finder. All rights reserved.</p>
            <p>Find your perfect match at minglefinder.com</p>
        </div>
    </div>
</body>
</html>
```

### **3.6 Password Reset Template**

1. **Template Name**: `Password Reset`
2. **Template ID**: `template_password_reset`
3. **Email Content**:

```html
Subject: Reset Your Mingle Finder Password

<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your Mingle Finder password.</p>
            <p>Click the button below to create a new password:</p>
            <a href="{{reset_link}}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>{{reset_link}}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>© 2024 Mingle Finder. All rights reserved.</p>
            <p>Find your perfect match at minglefinder.com</p>
        </div>
    </div>
</body>
</html>
```

## 🔑 **Step 4: Get Your Public Key**

1. In EmailJS dashboard, go to **"Account"** → **"General"**
2. Find your **Public Key** (e.g., `user_abc123xyz`)
3. Copy this key - you'll need it for environment variables

## ⚙️ **Step 5: Configure Environment Variables**

Add these to your deployment platform (Vercel, Netlify, etc.):

```bash
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_your_service_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=user_your_public_key

# Email Template IDs
NEXT_PUBLIC_EMAILJS_GENERAL_TEMPLATE_ID=template_general
NEXT_PUBLIC_EMAILJS_VERIFICATION_TEMPLATE_ID=template_verification
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_password_reset
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_welcome
NEXT_PUBLIC_EMAILJS_MATCH_TEMPLATE_ID=template_match
NEXT_PUBLIC_EMAILJS_MESSAGE_TEMPLATE_ID=template_message
```

## 🧪 **Step 6: Test Your Setup**

1. Deploy your app with the new environment variables
2. Go to `https://minglefinder.com/admin/email-test`
3. Test each email type:
   - General email
   - Verification email
   - Welcome email
   - Match notification
   - Message notification

## 📊 **Step 7: Monitor Usage**

1. Check EmailJS dashboard for email statistics
2. Monitor delivery rates and bounces
3. Upgrade plan if you exceed limits

## 🎯 **Expected Results**

After setup, your users will receive:
- ✅ **Professional-looking emails** with your branding
- ✅ **Instant email verification** for new accounts
- ✅ **Welcome emails** for better onboarding
- ✅ **Match notifications** to increase engagement
- ✅ **Message alerts** to boost conversations
- ✅ **Secure password reset** functionality

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Emails not sending**:
   - Check service ID and public key
   - Verify template IDs match exactly
   - Check EmailJS dashboard for errors

2. **Emails going to spam**:
   - Use a professional email address
   - Add SPF/DKIM records to your domain
   - Avoid spam trigger words

3. **Template variables not working**:
   - Ensure variable names match exactly: `{{user_name}}`
   - Check for typos in template IDs

## 💡 **Pro Tips**

1. **Use your domain email** (e.g., noreply@minglefinder.com) for better deliverability
2. **Test thoroughly** before going live
3. **Monitor bounce rates** and clean your email list
4. **Customize templates** to match your brand
5. **Set up email tracking** to measure engagement

## 🎉 **Success!**

Your Mingle Finder app now has professional email notifications that will:
- **Increase user engagement** with timely notifications
- **Improve user experience** with beautiful emails
- **Build trust** with professional communication
- **Boost conversions** with effective email marketing

**Your email system is now ready to help users find love! 💕**
