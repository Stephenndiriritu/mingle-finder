# 📧 EmailJS Setup Guide for Mingle Finder

## 🎯 **Why EmailJS?**

EmailJS allows you to send emails directly from the frontend without needing a backend email server. Perfect for:
- ✅ **No server configuration** required
- ✅ **Free tier available** (200 emails/month)
- ✅ **Easy setup** - just environment variables
- ✅ **Reliable delivery** through major email providers
- ✅ **Template management** through web dashboard

## 🚀 **Step-by-Step Setup**

### **Step 1: Create EmailJS Account**
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### **Step 2: Add Email Service**
1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook/Hotmail**
   - **Yahoo**
   - **Custom SMTP** (for business emails)

#### **For Gmail Setup:**
1. Select **"Gmail"**
2. Click **"Connect Account"**
3. Sign in with your Gmail account
4. Allow EmailJS permissions
5. Your service will be created with a **Service ID** (save this!)

### **Step 3: Create Email Templates**

You need to create 6 templates in EmailJS dashboard:

#### **Template 1: General Template**
- **Template Name**: `General Email`
- **Template ID**: `template_general` (save this!)
- **Template Content**:
```html
Subject: {{subject}}

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #ec4899;">💕 Mingle Finder</h1>
  </div>
  
  <div>
    {{{message}}}
  </div>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #999; text-align: center;">
    This email was sent from Mingle Finder
  </p>
</div>
```

#### **Template 2: Email Verification**
- **Template Name**: `Email Verification`
- **Template ID**: `template_verification`
- **Template Content**: (Use the HTML from the EmailJS implementation)

#### **Template 3: Password Reset**
- **Template Name**: `Password Reset`
- **Template ID**: `template_password_reset`

#### **Template 4: Welcome Email**
- **Template Name**: `Welcome Email`
- **Template ID**: `template_welcome`

#### **Template 5: Match Notification**
- **Template Name**: `Match Notification`
- **Template ID**: `template_match`

#### **Template 6: Message Notification**
- **Template Name**: `Message Notification`
- **Template ID**: `template_message`

### **Step 4: Get Your Public Key**
1. In EmailJS dashboard, go to **"Account"**
2. Find your **"Public Key"** (starts with something like `user_...`)
3. Copy this key

### **Step 5: Configure Environment Variables**

Add these to your `.env.local` file:

```bash
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=user_xxxxxxxxxxxxxxxx

# Template IDs
NEXT_PUBLIC_EMAILJS_GENERAL_TEMPLATE_ID=template_general
NEXT_PUBLIC_EMAILJS_VERIFICATION_TEMPLATE_ID=template_verification
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_password_reset
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_welcome
NEXT_PUBLIC_EMAILJS_MATCH_TEMPLATE_ID=template_match
NEXT_PUBLIC_EMAILJS_MESSAGE_TEMPLATE_ID=template_message
```

## 🧪 **Testing EmailJS Integration**

### **Test Email Function**
Create a test component to verify EmailJS is working:

```typescript
// components/EmailTest.tsx
import { sendEmail } from '@/lib/email'

export function EmailTest() {
  const testEmail = async () => {
    try {
      await sendEmail(
        'your-email@example.com',
        'Test Email from Mingle Finder',
        '<h1>Hello!</h1><p>EmailJS is working correctly!</p>'
      )
      alert('Email sent successfully!')
    } catch (error) {
      alert('Email failed: ' + error)
    }
  }

  return (
    <button onClick={testEmail}>
      Send Test Email
    </button>
  )
}
```

## 📊 **EmailJS Pricing**

### **Free Tier:**
- ✅ **200 emails/month**
- ✅ **2 email services**
- ✅ **2 email templates**
- ✅ **Basic support**

### **Personal Plan ($15/month):**
- ✅ **1,000 emails/month**
- ✅ **Unlimited services**
- ✅ **Unlimited templates**
- ✅ **Priority support**

### **Business Plan ($70/month):**
- ✅ **10,000 emails/month**
- ✅ **Advanced features**
- ✅ **Custom branding**

## 🔧 **Advanced Configuration**

### **Custom Email Templates**
You can customize the email templates in the EmailJS dashboard with:
- **Dynamic variables**: `{{variable_name}}`
- **HTML content**: Full HTML support
- **Conditional content**: Show/hide based on variables

### **Email Delivery Tracking**
EmailJS provides:
- ✅ **Delivery status** in dashboard
- ✅ **Email analytics**
- ✅ **Error logging**
- ✅ **Usage statistics**

## 🚨 **Important Notes**

### **Security:**
- ✅ **Public Key is safe** to expose in frontend
- ✅ **Service ID is safe** to expose
- ✅ **Template IDs are safe** to expose
- ❌ **Never expose** your EmailJS private key

### **Rate Limiting:**
- EmailJS has built-in rate limiting
- Free tier: 200 emails/month
- Upgrade if you need more

### **Email Deliverability:**
- Use a **verified email address** as sender
- Avoid **spam trigger words** in subject/content
- Keep **email content clean** and professional

## 🎯 **Benefits for Mingle Finder**

### **User Experience:**
- ✅ **Instant email verification**
- ✅ **Password reset emails**
- ✅ **Match notifications**
- ✅ **Message alerts**
- ✅ **Welcome emails**

### **Developer Experience:**
- ✅ **No server setup** required
- ✅ **Easy to test** and debug
- ✅ **Reliable delivery**
- ✅ **Professional templates**

### **Business Benefits:**
- ✅ **Cost effective** (free tier available)
- ✅ **Scalable** (upgrade as needed)
- ✅ **Professional appearance**
- ✅ **Analytics and tracking**

## 🚀 **Ready to Deploy!**

Once you've completed the setup:

1. ✅ **EmailJS account created**
2. ✅ **Email service connected**
3. ✅ **Templates created**
4. ✅ **Environment variables set**
5. ✅ **Test email sent successfully**

Your Mingle Finder app will now send beautiful, professional emails for:
- 📧 **Email verification**
- 🔐 **Password resets**
- 👋 **Welcome messages**
- 💕 **Match notifications**
- 💬 **Message alerts**

**EmailJS integration is complete and ready for production!** 🎉📧
