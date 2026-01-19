import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Checkout | TicketFlow",
  description: "Complete your ticket purchase",
}

// Mock data for demonstration
const mockEventData = {
  id: "1",
  title: "Taylor Swift | The Eras Tour",
  slug: "taylor-swift-eras-tour",
  image_url: "/live-music-crowd.png",
  start_date: "2025-03-15T19:00:00Z",
  venue: {
    name: "SoFi Stadium",
    city: "Los Angeles",
    state: "CA",
  },
}

const mockZones: Record<string, { id: string; name: string; price: number; color: string }> = {
  z1: { id: "z1", name: "Floor - Front Stage", price: 899, color: "#E91E63" },
  z2: { id: "z2", name: "Floor - General", price: 499, color: "#9C27B0" },
  z3: { id: "z3", name: "Lower Bowl", price: 349, color: "#3F51B5" },
  z4: { id: "z4", name: "Upper Bowl", price: 199, color: "#00BCD4" },
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string; zone?: string; quantity?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?redirect=/checkout?event=${params.event}&zone=${params.zone}&quantity=${params.quantity}`)
  }

  const eventId = params.event
  const zoneId = params.zone
  const quantity = Number.parseInt(params.quantity || "1", 10)

  if (!eventId || !zoneId || quantity < 1) {
    redirect("/events")
  }

  // Try to fetch real data
  let event = null
  let zone = null

  try {
    const { data: eventData } = await supabase.from("events").select("*, venue:venues(*)").eq("id", eventId).single()
    event = eventData

    if (event) {
      const { data: zoneData } = await supabase.from("ticket_zones").select("*").eq("id", zoneId).single()
      zone = zoneData
    }
  } catch {
    // Database not set up
  }

  // Use mock data
  if (!event) {
    event = mockEventData
    zone = mockZones[zoneId]
  }

  if (!event || !zone) {
    redirect("/events")
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Checkout</h1>
      <p className="mt-2 text-muted-foreground">Complete your purchase to secure your tickets</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Checkout form */}
        <div>
          <CheckoutForm event={event} zone={zone} quantity={quantity} userId={user.id} userEmail={user.email || ""} />
        </div>

        {/* Order summary */}
        <div>
          <OrderSummary event={event} zone={zone} quantity={quantity} />
        </div>
      </div>
    </div>
  )
}
