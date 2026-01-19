import { type NextRequest, NextResponse } from "next/server"

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorName, visitorEmail, totalPrice, quantity, skuName, selectedSlot, selectedSKU } = body

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: visitorEmail,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${skuName} - Van Gogh Expo`,
              description: `${quantity} ticket(s) for Van Gogh – An Immersive Story`,
            },
            unit_amount: Math.round((totalPrice / quantity) * 100), // Stripe expects amount in paise
          },
          quantity: quantity,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-cancelled`,
      metadata: {
        visitorName,
        visitorEmail,
        selectedSlot,
        selectedSKU,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
