#!/usr/bin/env tsx

import { getAccessToken, createOrder, capturePayment } from '../lib/paypal'

async function testPayPalIntegration() {
  console.log('🧪 Testing PayPal Integration...\n')

  try {
    // Test 1: Get Access Token
    console.log('1. Testing PayPal Authentication...')
    const accessToken = await getAccessToken()
    console.log('✅ Successfully obtained access token:', accessToken.substring(0, 20) + '...\n')

    // Test 2: Create Order
    console.log('2. Testing Order Creation...')
    const order = await createOrder('premium')
    console.log('✅ Successfully created order:', order.id)
    console.log('   Status:', order.status)
    console.log('   Links:', order.links?.length, 'links available')
    
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href
    if (approvalUrl) {
      console.log('   Approval URL:', approvalUrl.substring(0, 50) + '...')
    }
    console.log('')

    // Note: We can't test capture without actual user approval
    console.log('3. Payment Capture Test Skipped')
    console.log('   (Requires user approval in browser)\n')

    console.log('🎉 PayPal Integration Test Completed Successfully!')
    console.log('\nNext Steps:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Navigate to http://localhost:3000/app/payment')
    console.log('3. Try purchasing a premium plan')
    console.log('4. Use PayPal sandbox test accounts for payment')

  } catch (error) {
    console.error('❌ PayPal Integration Test Failed:')
    console.error(error)
    
    if (error instanceof Error && error.message.includes('credentials')) {
      console.log('\n💡 Troubleshooting:')
      console.log('1. Check your PayPal credentials in .env.local')
      console.log('2. Make sure you have valid sandbox credentials from https://developer.paypal.com/')
      console.log('3. Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set correctly')
    }
  }
}

// Run the test
testPayPalIntegration()
