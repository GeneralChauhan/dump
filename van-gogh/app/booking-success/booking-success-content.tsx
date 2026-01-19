"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const visitorName = searchParams.get("name")
  const visitorEmail = searchParams.get("email")
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (sessionId) {
      confirmBooking(sessionId)
    } else if (visitorName && visitorEmail) {
      setLoading(false)
      setSuccess(true)
    }
  }, [sessionId, visitorName, visitorEmail])

  const confirmBooking = async (id: string) => {
    try {
      const response = await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      })

      if (response.ok) {
        setSuccess(true)
      }
    } catch (error) {
      console.error("Error confirming booking:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <CardContent className="pt-12 pb-12 text-center">
        {loading ? (
          <p className="text-foreground/60 text-lg">Processing your booking...</p>
        ) : success ? (
          <>
            <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6 animate-in zoom-in duration-1000" />
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-2">Booking Confirmed!</h1>
            <div className="text-foreground/80 mb-8 space-y-2 text-lg">
              <p>Your Van Gogh Expo tickets have been confirmed.</p>
              {visitorEmail && (
                <p className="text-sm text-foreground/60">
                  Confirmation sent to: <span className="font-medium text-foreground">{visitorEmail}</span>
                </p>
              )}
            </div>
            <Link href="/">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Return to Home</Button>
            </Link>
          </>
        ) : (
          <>
            <p className="text-destructive mb-4 text-lg">Booking confirmation failed</p>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Home
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
