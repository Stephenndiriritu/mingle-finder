import { NextRequest, NextResponse } from 'next/server'

const subscriptionPlans = {
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    period: 'month'
  },
  premium_plus: {
    id: 'premium_plus',
    name: 'Premium Plus',
    price: 19.99,
    period: 'month'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const planId = searchParams.get('planId')
    const userId = searchParams.get('userId')

    if (!paymentId || !planId || !userId) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1 class="error">Payment Error</h1>
          <p>Missing required payment parameters.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/payment">Return to Payment Page</a>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
    if (!plan) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Plan</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1 class="error">Invalid Plan</h1>
          <p>The selected subscription plan is not valid.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/payment">Return to Payment Page</a>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Mock PayPal checkout page
    const mockPayPalPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>PayPal Checkout - Mock</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .paypal-container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .paypal-logo {
          color: #003087;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }
        .payment-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .amount {
          font-size: 28px;
          font-weight: bold;
          color: #003087;
          text-align: center;
          margin: 20px 0;
        }
        .button {
          background: #0070ba;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          margin: 10px 0;
        }
        .button:hover {
          background: #005ea6;
        }
        .button.cancel {
          background: #6c757d;
        }
        .button.cancel:hover {
          background: #5a6268;
        }
        .demo-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="paypal-container">
        <div class="demo-notice">
          <strong>🚀 DEMO MODE</strong><br>
          This is a mock PayPal checkout for demonstration purposes.<br>
          No real payment will be processed.
        </div>
        
        <div class="paypal-logo">PayPal</div>
        
        <h2>Review your payment</h2>
        
        <div class="payment-details">
          <h3>MingleFinder ${plan.name} Subscription</h3>
          <p><strong>Plan:</strong> ${plan.name}</p>
          <p><strong>Billing:</strong> Monthly</p>
          <p><strong>Description:</strong> ${plan.name} subscription with unlimited messaging and premium features</p>
        </div>
        
        <div class="amount">$${plan.price} USD</div>
        
        <form method="POST" action="/api/payment/execute">
          <input type="hidden" name="paymentId" value="${paymentId}">
          <input type="hidden" name="planId" value="${planId}">
          <input type="hidden" name="userId" value="${userId}">
          <input type="hidden" name="PayerID" value="MOCK-PAYER-ID">
          
          <button type="submit" class="button">
            Complete Payment ($${plan.price})
          </button>
        </form>
        
        <button onclick="cancelPayment()" class="button cancel">
          Cancel and Return
        </button>
        
        <div style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
          <p>🔒 Secure payment powered by PayPal</p>
          <p>In demo mode - no real charges will occur</p>
        </div>
      </div>
      
      <script>
        function cancelPayment() {
          window.location.href = '${process.env.NEXT_PUBLIC_APP_URL}/app/payment?cancelled=true';
        }
      </script>
    </body>
    </html>
    `

    return new NextResponse(mockPayPalPage, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('Mock PayPal page error:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <h1 class="error">Payment Error</h1>
        <p>An error occurred while processing your payment.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/payment">Return to Payment Page</a>
      </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}
