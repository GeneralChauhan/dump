import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Ticket } from "lucide-react"

interface OrderSummaryProps {
  event: {
    title: string
    image_url?: string
    start_date: string
    venue?: { name: string; city: string; state?: string }
  }
  zone: { name: string; price: number; color?: string }
  quantity: number
}

export function OrderSummary({ event, zone, quantity }: OrderSummaryProps) {
  const eventDate = new Date(event.start_date)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const subtotal = zone.price * quantity
  const serviceFee = subtotal * 0.15
  const total = subtotal + serviceFee

  return (
    <div className="sticky top-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event info */}
          <div className="flex gap-4">
            {event.image_url && (
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                <Image src={event.image_url || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate} at {formattedTime}
                </p>
                {event.venue && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.venue.name}, {event.venue.city}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Ticket details */}
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              <span className="font-medium">Tickets</span>
            </div>
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color || "#888" }} />
                  <span className="text-sm">{zone.name}</span>
                </div>
                <span className="text-sm">x{quantity}</span>
              </div>
              <p className="mt-1 text-right text-sm text-muted-foreground">${zone.price.toFixed(2)} each</p>
            </div>
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="rounded-lg bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            <p>🔒 Secure checkout powered by TicketFlow</p>
            <p className="mt-1">Your payment information is encrypted</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
