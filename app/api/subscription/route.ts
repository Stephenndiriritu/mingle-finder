import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import pool from "@/lib/db"
import { SUBSCRIPTION_PLANS, createOrder, capturePayment } from "@/lib/paypal"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current subscription
    const result = await pool.query(
      `SELECT subscription_type, subscription_expires_at
       FROM users WHERE id = $1`,
      [user.id]
    )

    const userData = result.rows[0]
    
    return NextResponse.json({
      subscription: {
        type: userData.subscription_type,
        expires_at: userData.subscription_expires_at,
      },
      available_plans: SUBSCRIPTION_PLANS,
    })
  } catch (error) {
    console.error("Failed to fetch subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
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

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error("Failed to create subscription:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, orderId } = await request.json()

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
    } else if (action === "cancel") {
      await pool.query(
        `UPDATE users 
         SET subscription_type = 'free',
             subscription_expires_at = NULL
         WHERE id = $1`,
        [user.id]
      )

      return NextResponse.json({ message: "Subscription cancelled successfully" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Failed to update subscription:", error)
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    )
  }
} 