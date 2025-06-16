import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createPesapalOrder, PESAPAL_SUBSCRIPTION_PLANS } from '@/lib/pesapal'
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

    const { planId, currency = 'KES', userPhone } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    if (!userPhone) {
      return NextResponse.json(
        { error: 'Phone number is required for Pesapal payments' },
        { status: 400 }
      )
    }

    const plan = PESAPAL_SUBSCRIPTION_PLANS[planId as keyof typeof PESAPAL_SUBSCRIPTION_PLANS]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Validate currency
    const supportedCurrencies = ['KES', 'UGX', 'TZS', 'USD']
    if (!supportedCurrencies.includes(currency.toUpperCase())) {
      return NextResponse.json(
        { error: 'Unsupported currency' },
        { status: 400 }
      )
    }

    // Create Pesapal order
    const pesapalOrder = await createPesapalOrder(
      planId,
      user.id,
      user.email,
      userPhone,
      currency
    )

    // Store payment order in database
    await pool.query(
      `INSERT INTO pesapal_orders (
        order_id, tracking_id, user_id, plan_id, amount, currency, 
        status, phone_number, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())
       ON CONFLICT (order_id) DO UPDATE SET
       tracking_id = $2, user_id = $3, plan_id = $4, amount = $5, 
       currency = $6, status = 'pending', phone_number = $7`,
      [
        pesapalOrder.orderId,
        pesapalOrder.trackingId,
        user.id,
        planId,
        (plan as any)[`price${currency}`] || plan.priceKES,
        currency.toUpperCase(),
        userPhone
      ]
    )

    return NextResponse.json({
      success: true,
      orderId: pesapalOrder.orderId,
      trackingId: pesapalOrder.trackingId,
      redirectUrl: pesapalOrder.redirectUrl,
      message: 'Pesapal payment order created successfully'
    })

  } catch (error) {
    console.error('Pesapal payment creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

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

    // Get order from database
    const orderResult = await pool.query(
      `SELECT * FROM pesapal_orders WHERE order_id = $1 AND user_id = $2`,
      [orderId, user.id]
    )

    if (!orderResult.rows[0]) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.order_id,
        trackingId: order.tracking_id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        planId: order.plan_id,
        createdAt: order.created_at,
        completedAt: order.completed_at
      }
    })

  } catch (error) {
    console.error('Error fetching Pesapal order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    )
  }
}
