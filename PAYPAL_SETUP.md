# PayPal Integration Setup Guide

This guide will help you set up PayPal sandbox integration for testing payments in your Mingle Finder application.

## 🚀 Quick Start

The PayPal integration is fully implemented and ready to use. You just need to add your sandbox credentials.

## 📋 Prerequisites

1. A PayPal account (personal or business)
2. Access to PayPal Developer Dashboard

## 🔧 Setup Instructions

### Step 1: Create PayPal Developer Account

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Log in with your PayPal account
3. Accept the developer agreement if prompted

### Step 2: Create Sandbox Application

1. Navigate to "My Apps & Credentials"
2. Make sure you're in the "Sandbox" tab
3. Click "Create App"
4. Fill in the application details:
   - **App Name**: `Mingle Finder Sandbox`
   - **Merchant**: Select your sandbox business account (or create one)
   - **Features**: Check "Accept Payments"
5. Click "Create App"

### Step 3: Get Your Credentials

After creating the app, you'll see:
- **Client ID**: Copy this value
- **Client Secret**: Click "Show" and copy this value

### Step 4: Update Environment Variables

Open your `.env.local` file and update the PayPal configuration:

```env
# PayPal Sandbox Credentials
PAYPAL_CLIENT_ID=your_actual_client_id_here
PAYPAL_CLIENT_SECRET=your_actual_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_actual_client_id_here
PAYPAL_MODE=sandbox
```

### Step 5: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the payment page:
   ```
   http://localhost:3000/app/payment
   ```

3. Try purchasing a premium plan using the PayPal buttons

## 🧪 Testing with Sandbox Accounts

PayPal provides test accounts for sandbox testing:

### Test Buyer Account
- **Email**: sb-buyer@business.example.com
- **Password**: Use the password from your sandbox accounts

### Test Credit Cards
You can also use these test credit card numbers:
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005

## 🔍 Verification

Run the test script to verify your setup:

```bash
node scripts/test-paypal.js
```

You should see:
```
🧪 Testing PayPal Integration...

Environment Check:
- PAYPAL_CLIENT_ID: ✅ Set
- PAYPAL_CLIENT_SECRET: ✅ Set
- API URL: https://api-m.sandbox.paypal.com

1. Testing PayPal Authentication...
✅ Successfully obtained access token: A21AAL...

🎉 PayPal Integration Test Completed Successfully!
```

## 🌟 Features Implemented

### ✅ Complete PayPal Integration
- Real PayPal SDK integration (not mock)
- Sandbox environment for testing
- Production-ready code

### ✅ Payment Flow
- Create PayPal orders
- Handle payment approval
- Capture payments
- Update user subscriptions

### ✅ Security
- Webhook signature verification
- Secure credential handling
- Error handling and logging

### ✅ Database Integration
- Payment order tracking
- Subscription management
- Transaction history

### ✅ User Experience
- PayPal button components
- Loading states
- Error handling
- Success notifications

## 🔄 Payment Flow

1. **User selects plan** → PayPal button appears
2. **Click PayPal button** → Order created in database
3. **Redirect to PayPal** → User approves payment
4. **Return to app** → Payment captured automatically
5. **Subscription activated** → User gets premium features

## 🛠 Troubleshooting

### Common Issues

1. **"Client Authentication failed"**
   - Check your Client ID and Client Secret
   - Make sure you're using sandbox credentials
   - Verify credentials are correctly set in `.env.local`

2. **PayPal buttons not loading**
   - Check browser console for errors
   - Verify `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
   - Make sure PayPal provider is wrapped around your app

3. **Database errors**
   - Run migrations: `npm run migrate`
   - Check database connection
   - Verify `payment_orders` table exists

### Getting Help

1. Check PayPal Developer documentation
2. Review browser console for errors
3. Check server logs for API errors
4. Test with PayPal's sandbox tools

## 🚀 Going Live

When ready for production:

1. Create a live PayPal app in the developer dashboard
2. Update environment variables with live credentials
3. Change `PAYPAL_MODE` to `live`
4. Set up webhook endpoints for production
5. Test thoroughly with real payments

## 📚 Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox/)
- [PayPal Webhooks](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)

---

**Note**: This integration uses PayPal's latest v2 API and React SDK for the best user experience and security.
