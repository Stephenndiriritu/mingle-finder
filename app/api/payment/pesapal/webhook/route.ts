import { NextRequest, NextResponse } from 'next/server'
import { getPesapalTransactionStatus, verifyPesapalSignature } from '@/lib/pesapal'
import pool from '@/lib/db'

// Handle Pesapal IPN (Instant Payment Notification) webhooks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderTrackingId = searchParams.get('OrderTrackingId')
    const orderMerchantReference = searchParams.get('OrderMerchantReference')
    const orderNotificationType = searchParams.get('OrderNotificationType')

    console.log('Pesapal IPN received:', {
      orderTrackingId,
      orderMerchantReference,
      orderNotificationType
    })

    if (!orderTrackingId || !orderMerchantReference) {
      console.error('Missing required parameters in IPN')
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    try {
      // Get transaction status from Pesapal
      const transactionStatus = await getPesapalTransactionStatus(orderTrackingId)
      
      console.log('IPN Transaction status:', transactionStatus)

      // Get existing order from database
      const orderResult = await pool.query(
        `SELECT * FROM pesapal_orders WHERE order_id = $1 OR tracking_id = $2`,
        [orderMerchantReference, orderTrackingId]
      )

      if (!orderResult.rows[0]) {
        console.error('Order not found for IPN:', orderMerchantReference)
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      const order = orderResult.rows[0]
      const isCompleted = transactionStatus.payment_status_description === 'Completed' ||
                         transactionStatus.payment_status_description === 'COMPLETED'

      // Update order status
      await pool.query(
        `UPDATE pesapal_orders 
         SET status = $1, pesapal_status = $2, updated_at = NOW()
         ${isCompleted ? ', completed_at = NOW()' : ''}
         WHERE id = $3`,
        [
          transactionStatus.payment_status_description?.toLowerCase() || 'unknown',
          transactionStatus.payment_status_description,
          order.id
        ]
      )

      // If payment is completed, update user subscription
      if (isCompleted && order.status !== 'completed') {
        console.log('Processing completed payment for user:', order.user_id)
        
        // Calculate subscription end date (30 days from now)
        const subscriptionEndDate = new Date()
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30)

        // Update user subscription
        await pool.query(
          `UPDATE users 
           SET subscription_type = $1, subscription_end_date = $2, updated_at = NOW()
           WHERE id = $3`,
          [order.plan_id, subscriptionEndDate, order.user_id]
        )

        // Log the subscription update
        await pool.query(
          `INSERT INTO subscription_history (
            user_id, plan_id, payment_method, amount, currency, 
            payment_reference, status, created_at
          ) VALUES ($1, $2, 'pesapal', $3, $4, $5, 'active', NOW())`,
          [
            order.user_id,
            order.plan_id,
            order.amount,
            order.currency,
            orderMerchantReference
          ]
        )

        console.log('User subscription updated successfully')
      }

      // Respond to Pesapal that we received the notification
      return NextResponse.json({
        success: true,
        message: 'IPN processed successfully'
      })

    } catch (statusError) {
      console.error('Error processing IPN:', statusError)
      return NextResponse.json(
        { error: 'Failed to process payment notification' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Pesapal IPN error:', error)
    return NextResponse.json(
      { error: 'IPN processing failed' },
      { status: 500 }
    )
  }
}

// Handle POST IPN requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Pesapal POST IPN received:', body)

    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = body

    if (!OrderTrackingId || !OrderMerchantReference) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Process the same way as GET request
    const transactionStatus = await getPesapalTransactionStatus(OrderTrackingId)
    
    // Update order and user subscription (same logic as GET)
    const orderResult = await pool.query(
      `SELECT * FROM pesapal_orders WHERE order_id = $1 OR tracking_id = $2`,
      [OrderMerchantReference, OrderTrackingId]
    )

    if (orderResult.rows[0]) {
      const order = orderResult.rows[0]
      const isCompleted = transactionStatus.payment_status_description === 'Completed' ||
                         transactionStatus.payment_status_description === 'COMPLETED'

      await pool.query(
        `UPDATE pesapal_orders 
         SET status = $1, pesapal_status = $2, updated_at = NOW()
         ${isCompleted ? ', completed_at = NOW()' : ''}
         WHERE id = $3`,
        [
          transactionStatus.payment_status_description?.toLowerCase() || 'unknown',
          transactionStatus.payment_status_description,
          order.id
        ]
      )

      if (isCompleted && order.status !== 'completed') {
        const subscriptionEndDate = new Date()
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30)

        await pool.query(
          `UPDATE users 
           SET subscription_type = $1, subscription_end_date = $2, updated_at = NOW()
           WHERE id = $3`,
          [order.plan_id, subscriptionEndDate, order.user_id]
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'POST IPN processed successfully'
    })

  } catch (error) {
    console.error('Pesapal POST IPN error:', error)
    return NextResponse.json(
      { error: 'POST IPN processing failed' },
      { status: 500 }
    )
  }
}
