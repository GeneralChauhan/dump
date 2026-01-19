"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Ticket, Mail, ArrowRight, RefreshCw } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"

function SignUpSuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    setResendMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setResendMessage("Confirmation email resent! Check your inbox and spam folder.")
    } catch (error) {
      setResendMessage("Failed to resend email. Please try again later.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">TicketFlow</span>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">{"We've sent you a confirmation link"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {email && (
              <p className="text-center text-sm text-muted-foreground">
                We sent a confirmation email to <span className="font-medium text-foreground">{email}</span>
              </p>
            )}
            <p className="text-center text-sm text-muted-foreground">
              Click the link in your email to verify your account. Check your spam folder if you don&apos;t see it.
            </p>

            {resendMessage && (
              <p
                className={`text-center text-sm ${resendMessage.includes("Failed") ? "text-destructive" : "text-green-500"}`}
              >
                {resendMessage}
              </p>
            )}

            <div className="flex flex-col gap-3">
              {email && (
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "Resending..." : "Resend confirmation email"}
                </Button>
              )}
              <Link href="/auth/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to sign in
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full gap-2">
                  Explore events
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> If you&apos;re not receiving emails, the confirmation might be disabled. Try
                signing in directly with your credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center">Loading...</div>}>
      <SignUpSuccessContent />
    </Suspense>
  )
}
