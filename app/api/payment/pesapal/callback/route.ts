import { NextRequest, NextResponse } from 'next/server'
import { getPesapalTransactionStatus } from '@/lib/pesapal'
import pool from '@/lib/db'

// Handle Pesapal payment callback (when user returns from payment)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderTrackingId = searchParams.get('OrderTrackingId')
    const orderMerchantReference = searchParams.get('OrderMerchantReference')

    console.log('Pesapal callback received:', {
      orderTrackingId,
      orderMerchantReference
    })

    if (!orderTrackingId || !orderMerchantReference) {
      console.error('Missing required parameters in callback')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/app/payment?error=missing_params&gateway=pesapal`
      )
    }

    try {
      // Get transaction status from Pesapal
      const transactionStatus = await getPesapalTransactionStatus(orderTrackingId)
      
      console.log('Transaction status from Pesapal:', transactionStatus)

      // Update order in database
      await pool.query(
        `UPDATE pesapal_orders 
         SET status = $1, pesapal_status = $2, updated_at = NOW()
         WHERE order_id = $3 OR tracking_id = $4`,
        [
          transactionStatus.payment_status_description?.toLowerCase() || 'unknown',
          transactionStatus.payment_status_description,
          orderMerchantReference,
          orderTrackingId
        ]
      )

      // Determine redirect URL based on payment status
      const isSuccess = transactionStatus.payment_status_description === 'Completed' ||
                       transactionStatus.payment_status_description === 'COMPLETED'

      if (isSuccess) {
        // Payment successful - redirect to success page
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/app/payment/success?gateway=pesapal&orderId=${orderMerchantReference}`
        )
      } else {
        // Payment failed or pending - redirect to payment page with status
        const status = transactionStatus.payment_status_description?.toLowerCase() || 'failed'
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/app/payment?status=${status}&gateway=pesapal&orderId=${orderMerchantReference}`
        )
      }

    } catch (statusError) {
      console.error('Error getting transaction status:', statusError)
      
      // Redirect to payment page with error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/app/payment?error=status_check_failed&gateway=pesapal`
      )
    }

  } catch (error) {
    console.error('Pesapal callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/payment?error=callback_failed&gateway=pesapal`
    )
  }
}

// Handle POST requests (alternative callback method)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Pesapal POST callback received:', body)

    const { OrderTrackingId, OrderMerchantReference } = body

    if (!OrderTrackingId || !OrderMerchantReference) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get transaction status from Pesapal
    const transactionStatus = await getPesapalTransactionStatus(OrderTrackingId)
    
    // Update order in database
    await pool.query(
      `UPDATE pesapal_orders 
       SET status = $1, pesapal_status = $2, updated_at = NOW()
       WHERE order_id = $3 OR tracking_id = $4`,
      [
        transactionStatus.payment_status_description?.toLowerCase() || 'unknown',
        transactionStatus.payment_status_description,
        OrderMerchantReference,
        OrderTrackingId
      ]
    )

    return NextResponse.json({
      success: true,
      status: transactionStatus.payment_status_description
    })

  } catch (error) {
    console.error('Pesapal POST callback error:', error)
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    )
  }
}
