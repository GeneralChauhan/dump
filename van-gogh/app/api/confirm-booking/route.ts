import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Create booking in Supabase
    const supabase = await createClient()
    const { visitorName, visitorEmail, selectedSlot, selectedSKU } = session.metadata

    // Get the booking details from request body for quantity
    const { quantity, totalPrice } = body

    const { data, error } = await supabase.from("bookings").insert({
      user_id: "guest-user", // You can use actual user ID if authenticated
      time_slot_id: selectedSlot,
      sku_id: selectedSKU,
      quantity,
      total_price: totalPrice,
      email: visitorEmail,
      visitor_name: visitorName,
      status: "confirmed",
    })

    if (error) throw error

    return NextResponse.json({ success: true, bookingId: data[0]?.id })
  } catch (error) {
    console.error("Booking confirmation error:", error)
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 })
  }
}
