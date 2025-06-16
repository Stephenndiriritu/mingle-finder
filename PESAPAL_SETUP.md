# Pesapal Payment Gateway Integration Setup

## Overview
This integration adds Pesapal payment gateway support to your Mingle Finder platform, enabling users in East Africa to pay using:
- **Mobile Money**: M-Pesa, Airtel Money, MTN Mobile Money
- **Bank Cards**: Visa, Mastercard (local and international)
- **Bank Transfers**: Direct bank transfers
- **Digital Wallets**: Various local payment methods

## 🚀 Quick Setup

### 1. Get Pesapal Credentials

1. **Sign up at Pesapal**:
   - Production: https://www.pesapal.com/
   - Sandbox: https://developer.pesapal.com/

2. **Get your credentials**:
   - Consumer Key
   - Consumer Secret
   - IPN ID (after registering your webhook URL)

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# Pesapal Configuration
PESAPAL_CONSUMER_KEY=your_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_consumer_secret_here
PESAPAL_IPN_ID=your_ipn_id_here

# Optional: Set to 'production' for live payments
NODE_ENV=development
```

### 3. Database Setup

Run the SQL migration to create required tables:

```bash
# Connect to your PostgreSQL database and run:
psql -d your_database_name -f scripts/create-pesapal-tables.sql
```

Or manually execute the SQL in `scripts/create-pesapal-tables.sql`

### 4. Register Webhook URLs

In your Pesapal dashboard, register these URLs:

**IPN (Instant Payment Notification) URL:**
```
https://yourdomain.com/api/payment/pesapal/webhook
```

**Callback URL (automatically set by the integration):**
```
https://yourdomain.com/api/payment/pesapal/callback
```

## 🔧 Configuration Details

### Supported Currencies & Pricing

The integration supports multiple currencies with automatic conversion:

| Currency | Countries | Example Pricing |
|----------|-----------|----------------|
| KES | Kenya | Premium: KSh 1,299 |
| UGX | Uganda | Premium: USh 37,000 |
| TZS | Tanzania | Premium: TSh 23,000 |
| USD | International | Premium: $9.99 |

### Payment Flow

1. **User selects plan** → Clicks "Pay with Pesapal"
2. **Payment form** → User enters phone number and selects currency
3. **Pesapal redirect** → User redirected to Pesapal payment page
4. **Payment completion** → User completes payment via mobile money/card
5. **Webhook notification** → Pesapal notifies your server
6. **Subscription activation** → User subscription is automatically activated

## 🛠️ API Endpoints

### Create Payment Order
```
POST /api/payment/pesapal/create
```

**Request Body:**
```json
{
  "planId": "premium",
  "currency": "KES",
  "userPhone": "+254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "MINGLE_1234567890_abcd1234",
  "trackingId": "pesapal_tracking_id",
  "redirectUrl": "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest"
}
```

### Payment Callback
```
GET /api/payment/pesapal/callback?OrderTrackingId=xxx&OrderMerchantReference=xxx
```

### Webhook Handler
```
GET /api/payment/pesapal/webhook?OrderTrackingId=xxx&OrderMerchantReference=xxx
```

## 🎨 UI Components

### PesapalButton Component

```tsx
import { PesapalButton } from '@/components/pesapal-button'

<PesapalButton
  planId="premium"
  onSuccess={() => {
    toast.success('Payment successful!')
    window.location.reload()
  }}
  onError={(error) => {
    toast.error('Payment failed. Please try again.')
  }}
/>
```

## 🔒 Security Features

- **HMAC Signature Verification**: All webhooks are verified using HMAC-SHA256
- **Order Validation**: Orders are validated against database records
- **Duplicate Prevention**: Prevents duplicate payment processing
- **Secure Token Handling**: Access tokens are securely managed

## 📊 Database Schema

### pesapal_orders Table
```sql
- id (SERIAL PRIMARY KEY)
- order_id (VARCHAR UNIQUE) -- Your internal order ID
- tracking_id (VARCHAR) -- Pesapal tracking ID
- user_id (UUID) -- References users table
- plan_id (VARCHAR) -- Subscription plan
- amount (DECIMAL) -- Payment amount
- currency (VARCHAR) -- Payment currency
- status (VARCHAR) -- pending, completed, failed
- pesapal_status (VARCHAR) -- Pesapal's status
- phone_number (VARCHAR) -- User's phone number
- created_at, updated_at, completed_at (TIMESTAMP)
```

### subscription_history Table
```sql
- id (SERIAL PRIMARY KEY)
- user_id (UUID) -- References users table
- plan_id (VARCHAR) -- Subscription plan
- payment_method (VARCHAR) -- 'pesapal' or 'paypal'
- amount (DECIMAL) -- Payment amount
- currency (VARCHAR) -- Payment currency
- payment_reference (VARCHAR) -- Transaction reference
- status (VARCHAR) -- active, expired, cancelled
- start_date, end_date, created_at (TIMESTAMP)
```

## 🧪 Testing

### Sandbox Testing

1. Use sandbox credentials from Pesapal developer portal
2. Test with sandbox phone numbers:
   - Kenya: +254700000000
   - Uganda: +256700000000
   - Tanzania: +255700000000

### Test Payment Flow

1. Go to `/app/payment`
2. Select a premium plan
3. Click "Pay with Pesapal"
4. Enter test phone number
5. Complete payment on Pesapal sandbox
6. Verify subscription activation

## 🚨 Troubleshooting

### Common Issues

1. **"Pesapal setup required" message**
   - Check environment variables are set correctly
   - Ensure PESAPAL_CONSUMER_KEY is not placeholder value

2. **Payment creation fails**
   - Verify phone number format (+254XXXXXXXXX)
   - Check currency is supported (KES, UGX, TZS, USD)
   - Ensure user is authenticated

3. **Webhook not receiving notifications**
   - Verify IPN URL is registered in Pesapal dashboard
   - Check webhook URL is publicly accessible
   - Ensure PESAPAL_IPN_ID is set correctly

4. **Database errors**
   - Run the migration script: `scripts/create-pesapal-tables.sql`
   - Check database connection and permissions

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=pesapal:*
```

## 📞 Support

- **Pesapal Documentation**: https://developer.pesapal.com/
- **Pesapal Support**: support@pesapal.com
- **Integration Issues**: Check the console logs and database for error details

## 🎯 Production Checklist

- [ ] Production Pesapal credentials configured
- [ ] IPN URL registered and accessible
- [ ] Database tables created
- [ ] SSL certificate installed (required for webhooks)
- [ ] Test payments completed successfully
- [ ] Webhook signature verification working
- [ ] Error handling and logging implemented
- [ ] User subscription flow tested end-to-end

## 🌍 Supported Countries

- **Kenya** 🇰🇪 - KES (Kenyan Shilling)
- **Uganda** 🇺🇬 - UGX (Ugandan Shilling)  
- **Tanzania** 🇹🇿 - TZS (Tanzanian Shilling)
- **International** 🌍 - USD (US Dollar)

Your Pesapal integration is now ready! Users can pay using their preferred local payment methods. 🚀
