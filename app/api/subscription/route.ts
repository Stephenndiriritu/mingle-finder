import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import pool from "@/lib/db"
import { SUBSCRIPTION_PLANS, createOrder, capturePayment } from "@/lib/paypal"

/**
 * Create a new subscription order
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId } = await request.json()
    if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Create PayPal order
    const order = await createOrder(planId)
    if (!order.id) {
      return NextResponse.json(
        { error: "Failed to create PayPal order" },
        { status: 500 }
      )
    }

    // Store order details in database for verification
    await pool.query(
      `INSERT INTO payment_orders (user_id, order_id, plan_id, status)
       VALUES ($1, $2, $3, 'pending')`,
      [user.id, order.id, planId]
    )

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
    })
  } catch (error) {
    console.error("Subscription creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
      { status: 500 }
    )
  }
}

/**
 * Handle subscription actions (capture, cancel, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, orderId } = await request.json()

    // Handle payment capture
    if (action === "capture" && orderId) {
      // Verify order exists and is pending
      const orderResult = await pool.query(
        `SELECT plan_id FROM payment_orders 
         WHERE order_id = $1 AND user_id = $2 AND status = 'pending'`,
        [orderId, user.id]
      )

      if (!orderResult.rows[0]) {
        return NextResponse.json({ error: "Invalid order" }, { status: 400 })
      }

      // Capture PayPal payment
      const captureResult = await capturePayment(orderId)
      if (captureResult.status !== "COMPLETED") {
        return NextResponse.json(
          { error: "Payment capture failed" },
          { status: 400 }
        )
      }

      // Set subscription expiry to 30 days from now
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)

      // Update subscription and order status
      await pool.query("BEGIN")
      try {
        await pool.query(
          `UPDATE users 
           SET subscription_type = $1,
               subscription_expires_at = $2
           WHERE id = $3`,
          [orderResult.rows[0].plan_id, expiryDate, user.id]
        )

        await pool.query(
          `UPDATE payment_orders 
           SET status = 'completed', 
               completed_at = CURRENT_TIMESTAMP
           WHERE order_id = $1`,
          [orderId]
        )

        await pool.query("COMMIT")
      } catch (error) {
        await pool.query("ROLLBACK")
        throw error
      }

      return NextResponse.json({
        message: "Payment completed successfully",
        subscription: {
          type: orderResult.rows[0].plan_id,
          expires_at: expiryDate,
        },
      })
    }
    
    // Handle subscription cancellation
    else if (action === "cancel") {
      await pool.query(
        `UPDATE users 
         SET subscription_cancel_requested = true
         WHERE id = $1`,
        [user.id]
      )
      
      return NextResponse.json({
        message: "Subscription cancellation requested",
      })
    }
    
    // Handle subscription resumption
    else if (action === "resume") {
      await pool.query(
        `UPDATE users 
         SET subscription_cancel_requested = false
         WHERE id = $1`,
        [user.id]
      )
      
      return NextResponse.json({
        message: "Subscription resumption requested",
      })
    }
    
    else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Subscription action error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process subscription action" },
      { status: 500 }
    )
  }
} 
