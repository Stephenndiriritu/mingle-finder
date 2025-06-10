import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paypal'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, headers)
    if (!isValid) {
      console.error('Invalid PayPal webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('PayPal webhook event:', event.event_type)

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(event)
        break
      
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptured(event)
        break
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.FAILED':
        await handlePaymentFailed(event)
        break
      
      default:
        console.log('Unhandled PayPal webhook event:', event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleOrderApproved(event: any) {
  const orderId = event.resource.id
  console.log('Order approved:', orderId)
  
  // Update order status in database
  await pool.query(
    `UPDATE payment_orders SET status = 'approved' WHERE order_id = $1`,
    [orderId]
  )
}

async function handlePaymentCaptured(event: any) {
  const captureId = event.resource.id
  const orderId = event.resource.supplementary_data?.related_ids?.order_id
  
  if (!orderId) {
    console.error('No order ID found in payment capture event')
    return
  }

  console.log('Payment captured:', captureId, 'for order:', orderId)
  
  try {
    // Get order details
    const orderResult = await pool.query(
      `SELECT * FROM payment_orders WHERE order_id = $1`,
      [orderId]
    )

    if (!orderResult.rows[0]) {
      console.error('Order not found:', orderId)
      return
    }

    const order = orderResult.rows[0]
    
    // Update order status
    await pool.query(
      `UPDATE payment_orders SET 
       status = 'completed', 
       capture_id = $1, 
       completed_at = NOW() 
       WHERE order_id = $2`,
      [captureId, orderId]
    )

    // Update user subscription
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1) // Add 1 month

    await pool.query(
      `UPDATE users SET 
       subscription_type = $1, 
       subscription_status = 'active',
       subscription_start_date = NOW(),
       subscription_end_date = $2,
       updated_at = NOW()
       WHERE id = $3`,
      [order.plan_id, subscriptionEndDate, order.user_id]
    )

    console.log('Subscription updated for user:', order.user_id, 'to plan:', order.plan_id)
  } catch (error) {
    console.error('Error processing payment capture:', error)
  }
}

async function handlePaymentFailed(event: any) {
  const orderId = event.resource.supplementary_data?.related_ids?.order_id
  
  if (!orderId) {
    console.error('No order ID found in payment failed event')
    return
  }

  console.log('Payment failed for order:', orderId)
  
  // Update order status
  await pool.query(
    `UPDATE payment_orders SET status = 'failed' WHERE order_id = $1`,
    [orderId]
  )
}
