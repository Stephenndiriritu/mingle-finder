#!/usr/bin/env node

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const PAYPAL_API_URL = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are not configured");
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`PayPal auth error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function testPayPalIntegration() {
  console.log('🧪 Testing PayPal Integration...\n');

  try {
    // Check environment variables
    console.log('Environment Check:');
    console.log('- PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('- PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('- API URL:', PAYPAL_API_URL);
    console.log('');

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials are missing from environment variables');
    }

    // Test 1: Get Access Token
    console.log('1. Testing PayPal Authentication...');
    const accessToken = await getAccessToken();
    console.log('✅ Successfully obtained access token:', accessToken.substring(0, 20) + '...\n');

    console.log('🎉 PayPal Integration Test Completed Successfully!');
    console.log('\nNext Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Navigate to http://localhost:3000/app/payment');
    console.log('3. Try purchasing a premium plan');
    console.log('4. Use PayPal sandbox test accounts for payment');

  } catch (error) {
    console.error('❌ PayPal Integration Test Failed:');
    console.error(error.message);
    
    if (error.message.includes('credentials')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your PayPal credentials in .env.local');
      console.log('2. Make sure you have valid sandbox credentials from https://developer.paypal.com/');
      console.log('3. Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set correctly');
    }
  }
}

// Run the test
testPayPalIntegration();
