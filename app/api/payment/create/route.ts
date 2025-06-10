import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createOrder, SUBSCRIPTION_PLANS } from '@/lib/paypal'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Create PayPal order using real PayPal API
    const order = await createOrder(planId)

    // Store payment order in database
    await pool.query(
      `INSERT INTO payment_orders (order_id, user_id, plan_id, amount, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW())
       ON CONFLICT (order_id) DO UPDATE SET
       user_id = $2, plan_id = $3, amount = $4, status = 'pending'`,
      [order.id, user.id, planId, plan.price]
    )

    // Find approval URL from PayPal response
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approvalUrl) {
      throw new Error('No approval URL received from PayPal')
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl,
      message: 'Payment order created successfully'
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve payment order status
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      )
    }

    // Fetch order from database
    const result = await pool.query(
      `SELECT * FROM payment_orders WHERE order_id = $1 AND user_id = $2`,
      [orderId, user.id]
    )

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      orderId,
      status: result.rows[0].status,
      planId: result.rows[0].plan_id,
      amount: result.rows[0].amount,
      createdAt: result.rows[0].created_at,
      message: 'Order found'
    })

  } catch (error) {
    console.error('Payment retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve payment order' },
      { status: 500 }
    )
  }
}
