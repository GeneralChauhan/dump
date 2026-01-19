import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Ticket, Users, BarChart3, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Ticket,
    title: "Easy Ticketing",
    description: "Create and sell tickets in minutes with our intuitive platform",
  },
  {
    icon: Users,
    title: "Audience Management",
    description: "Track attendees and manage check-ins with QR scanning",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Monitor sales and attendance with detailed reports",
  },
]

export function CTASection() {
  return (
    <section className="border-t border-border/50 bg-gradient-to-b from-background to-card/50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-2">
          <GlowingEffect spread={60} glow={true} disabled={false} proximity={100} inactiveZone={0.01} borderWidth={2} />

          <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background p-8 sm:p-12 lg:p-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Ready to Host Your Own Event?
              </h2>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Join thousands of organizers who trust TicketFlow to sell tickets and manage their events. Start for
                free today.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/sign-up?role=organizer">
                  <Button size="lg" className="gap-2 px-8">
                    Start Selling Tickets
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/organizer">
                  <Button size="lg" variant="outline" className="px-8 bg-transparent">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border border-border/50 bg-background/50 p-6 text-center backdrop-blur"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
