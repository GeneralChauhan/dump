"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import type { Event, TicketZone } from "@/lib/types"

interface TicketSelectorProps {
  event: Event
  ticketZones: TicketZone[]
}

export function TicketSelector({ event, ticketZones }: TicketSelectorProps) {
  const router = useRouter()
  const [selectedZone, setSelectedZone] = useState<string>("")
  const [quantity, setQuantity] = useState(1)

  const zone = ticketZones.find((z) => z.id === selectedZone)
  const ticketsAvailable = zone ? zone.capacity - zone.tickets_sold : 0
  const maxQuantity = Math.min(ticketsAvailable, 10)

  const subtotal = zone ? zone.price * quantity : 0
  const serviceFee = subtotal * 0.15
  const total = subtotal + serviceFee

  const handleCheckout = () => {
    if (!selectedZone) return
    // Navigate to checkout with selected options
    const params = new URLSearchParams({
      event: event.id,
      zone: selectedZone,
      quantity: quantity.toString(),
    })
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Zone selection */}
      <div>
        <Label className="mb-2 block">Select Ticket Type</Label>
        <Select value={selectedZone} onValueChange={setSelectedZone}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a section" />
          </SelectTrigger>
          <SelectContent>
            {ticketZones.map((zone) => {
              const available = zone.capacity - zone.tickets_sold
              const soldOut = available === 0
              return (
                <SelectItem key={zone.id} value={zone.id} disabled={soldOut}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color || "#888" }} />
                      <span>{zone.name}</span>
                    </div>
                    <span className="font-semibold">${zone.price}</span>
                  </div>
                  {soldOut && <span className="text-xs text-destructive"> (Sold Out)</span>}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {zone && zone.description && <p className="mt-2 text-sm text-muted-foreground">{zone.description}</p>}
      </div>

      {/* Quantity selection */}
      {selectedZone && (
        <div>
          <Label className="mb-2 block">Quantity</Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {ticketsAvailable} tickets available (max {maxQuantity} per order)
          </p>
        </div>
      )}

      {/* Price breakdown */}
      {selectedZone && (
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {quantity}x {zone?.name}
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Checkout button */}
      <Button onClick={handleCheckout} disabled={!selectedZone} className="w-full gap-2" size="lg">
        <ShoppingCart className="h-5 w-5" />
        {selectedZone ? `Get Tickets - $${total.toFixed(2)}` : "Select tickets to continue"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By purchasing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
