import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Calendar, MapPin, ArrowRight } from "lucide-react"

// Mock featured events data
const featuredEvents = [
  {
    id: "1",
    title: "Taylor Swift | The Eras Tour",
    slug: "taylor-swift-eras-tour",
    image: "/taylor-swift-concert-stage-lights.jpg",
    date: "Mar 15, 2025",
    venue: "SoFi Stadium",
    city: "Los Angeles, CA",
    minPrice: 199,
    category: "Concerts",
    isSoldOut: false,
  },
  {
    id: "2",
    title: "NBA Finals 2025 - Game 7",
    slug: "nba-finals-2025",
    image: "/basketball-arena-nba-finals.jpg",
    date: "Jun 22, 2025",
    venue: "Madison Square Garden",
    city: "New York, NY",
    minPrice: 350,
    category: "Sports",
    isSoldOut: false,
  },
  {
    id: "3",
    title: "Hamilton - Broadway",
    slug: "hamilton-broadway",
    image: "/hamilton-broadway-theater-stage.jpg",
    date: "Apr 5, 2025",
    venue: "Richard Rodgers Theatre",
    city: "New York, NY",
    minPrice: 179,
    category: "Theater",
    isSoldOut: false,
  },
]

export function FeaturedEvents() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Events</h2>
            <p className="mt-2 text-muted-foreground">{"Don't miss out on these hot events"}</p>
          </div>
          <Link href="/events?featured=true" className="hidden sm:block">
            <Button variant="ghost" className="gap-2">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Events grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-2 transition-all hover:border-primary/50">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <div className="relative">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category badge */}
                    <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground hover:bg-primary">
                      {event.category}
                    </Badge>

                    {/* Sold out badge */}
                    {event.isSoldOut && (
                      <Badge variant="destructive" className="absolute right-3 top-3">
                        Sold Out
                      </Badge>
                    )}

                    {/* Price */}
                    <div className="absolute bottom-3 right-3 rounded-lg bg-background/90 px-3 py-1.5 backdrop-blur">
                      <span className="text-sm text-muted-foreground">From </span>
                      <span className="font-semibold text-foreground">${event.minPrice}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold leading-tight group-hover:text-primary">{event.title}</h3>
                    <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {event.venue}, {event.city}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile view all button */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/events?featured=true">
            <Button variant="outline" className="gap-2 bg-transparent">
              View all featured events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
