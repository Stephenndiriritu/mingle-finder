import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { capturePayment, SUBSCRIPTION_PLANS } from '@/lib/paypal'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify order exists and belongs to user
    const orderResult = await pool.query(
      `SELECT * FROM payment_orders WHERE order_id = $1 AND user_id = $2 AND status = 'pending'`,
      [orderId, user.id]
    )

    if (!orderResult.rows[0]) {
      return NextResponse.json(
        { error: 'Order not found or already processed' },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]
    const plan = SUBSCRIPTION_PLANS[order.plan_id as keyof typeof SUBSCRIPTION_PLANS]

    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Capture PayPal payment
    const captureResult = await capturePayment(orderId)

    if (captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment capture failed' },
        { status: 400 }
      )
    }

    // Update order status in database
    await pool.query(
      `UPDATE payment_orders SET status = 'completed', completed_at = NOW() WHERE order_id = $1`,
      [orderId]
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
      [order.plan_id, subscriptionEndDate, user.id]
    )

    console.log('Payment captured and subscription updated for user:', user.id, 'to plan:', order.plan_id)

    return NextResponse.json({
      success: true,
      orderId,
      captureId: captureResult.id,
      status: captureResult.status,
      planId: order.plan_id,
      amount: order.amount,
      message: 'Payment completed successfully'
    })

  } catch (error) {
    console.error('Payment execution error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/payment?error=execution_failed`
    )
  }
}

// GET endpoint to handle PayPal return URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const PayerID = searchParams.get('PayerID')

    if (!token || !PayerID) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/app/payment?error=missing_params`
      )
    }

    // Redirect to frontend to handle payment completion
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/payment/complete?token=${token}&PayerID=${PayerID}`
    )

  } catch (error) {
    console.error('Payment return handling error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/payment?error=return_failed`
    )
  }
}
