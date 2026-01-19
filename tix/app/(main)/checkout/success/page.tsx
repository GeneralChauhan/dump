import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Ticket, Mail, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Purchase Successful | TicketFlow",
  description: "Your tickets have been purchased successfully",
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const params = await searchParams
  const orderId = params.order

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>

        <h1 className="mt-6 text-3xl font-bold">Purchase Successful!</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your tickets have been confirmed</p>

        {orderId && (
          <p className="mt-4 text-sm text-muted-foreground">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Check Your Email
          </CardTitle>
          <CardDescription>{"We've sent your tickets and order confirmation to your email address"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="font-medium">What happens next?</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  1
                </span>
                Check your email for the order confirmation and tickets
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  2
                </span>
                Your tickets include QR codes for easy entry at the venue
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  3
                </span>
                You can also access your tickets anytime in My Tickets
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/my-tickets">
          <Button size="lg" className="w-full gap-2 sm:w-auto">
            <Ticket className="h-5 w-5" />
            View My Tickets
          </Button>
        </Link>
        <Link href="/events">
          <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto bg-transparent">
            Browse More Events
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
