"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Lock } from "lucide-react"
import Link from "next/link"
import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"

export default function PaymentPage() {
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const [bookingData, setBookingData] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingBooking")
    if (pending) {
      setBookingData(JSON.parse(pending))
    }
  }, [])

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const handleDummyPayment = async () => {
    setProcessing(true)
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    sessionStorage.removeItem("pendingBooking")
    // Redirect to success page with booking details
    window.location.href = `/booking-success?name=${encodeURIComponent(bookingData?.visitorName)}&email=${encodeURIComponent(bookingData?.visitorEmail)}`
  }

  if (!bookingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/80">Loading payment details...</p>
      </div>
    )
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#1275d8"
            colorB="#e19136"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0066ff"
            upColor="#0066ff"
            downColor="#d1d1d1"
            leftColor="#e19136"
            rightColor="#e19136"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className={`relative z-10 min-h-screen flex items-center px-4 md:px-8 lg:px-16 py-12 transition-opacity duration-700 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}>
        <div className="mx-auto w-full max-w-4xl">
          {/* Header */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-4 inline-block rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md">
              <p className="font-mono text-xs text-foreground/90 flex items-center gap-2">
                <CreditCard className="h-3 w-3" />
                Secure Payment
              </p>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-2 leading-tight">Secure Payment</h1>
            <p className="text-lg text-foreground/90 max-w-xl">Complete your Van Gogh Expo booking</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Visitor Name</span>
                  <span className="font-medium text-foreground">{bookingData.visitorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Ticket Type</span>
                  <span className="font-medium text-foreground">{bookingData.skuName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Quantity</span>
                  <span className="font-medium text-foreground">{bookingData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Email</span>
                  <span className="font-medium text-foreground text-sm">{bookingData.visitorEmail}</span>
                </div>

                <div className="border-t border-border/30 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Total Amount</span>
                    <span className="text-3xl font-light text-accent">₹{bookingData.totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Info */}
            <Card className="border-border/50 bg-card/30 backdrop-blur-md">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Secure Payment Gateway</p>
                    <p className="text-sm text-foreground/60">
                      This is a dummy Razorpay integration. In production, this will connect to the actual Razorpay
                      payment gateway with full encryption and security.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Card */}
          <div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-md sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-foreground/60">Amount to Pay</p>
                  <p className="text-2xl font-light text-accent">₹{bookingData.totalPrice}</p>
                </div>

                <div className="border-t border-border/30 pt-4 space-y-4">
                  <Button
                    onClick={handleDummyPayment}
                    disabled={processing}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
                  >
                    {processing ? "Processing..." : "Pay with Razorpay"}
                  </Button>

                  <Link href="/">
                    <Button variant="outline" className="w-full bg-transparent border-border/50">
                      Cancel Booking
                    </Button>
                  </Link>

                  <p className="text-xs text-foreground/50 text-center">
                    Your payment is secure and encrypted. Confirmation will be sent to your email.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
