import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Calendar, MapPin, Clock, Users, Share2, Heart, ArrowLeft, Info } from "lucide-react"
import { TicketSelector } from "@/components/events/ticket-selector"
import { createClient } from "@/lib/supabase/server"

// Mock event data
const mockEventData = {
  id: "1",
  title: "Taylor Swift | The Eras Tour",
  slug: "taylor-swift-eras-tour",
  description: `Experience the concert of a lifetime as Taylor Swift brings her record-breaking Eras Tour to SoFi Stadium. This extraordinary show spans Taylor's entire discography, celebrating the music that defined a generation.

From her country roots to her pop evolution, this three-hour spectacular features stunning visuals, elaborate costumes, and all your favorite hits including "Shake It Off," "Love Story," "Anti-Hero," and many more.

Don't miss this once-in-a-lifetime opportunity to see one of the world's biggest artists perform live!`,
  short_description: "The most anticipated concert tour of the decade",
  image_url: "/taylor-swift-concert-stage-lights-spectacular.jpg",
  banner_url: "/taylor-swift-eras-tour-banner.jpg",
  start_date: "2025-03-15T19:00:00Z",
  end_date: "2025-03-15T23:00:00Z",
  doors_open: "2025-03-15T17:00:00Z",
  status: "published",
  is_featured: true,
  min_price: 199,
  max_price: 899,
  total_capacity: 50000,
  tickets_sold: 45000,
  venue: {
    id: "v1",
    name: "SoFi Stadium",
    address: "1001 Stadium Dr",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    capacity: 70000,
  },
  category: {
    id: "c1",
    name: "Concerts",
    slug: "concerts",
  },
  organization: {
    id: "o1",
    name: "Live Nation Entertainment",
    logo_url: "/live-nation-logo.png",
  },
  ticket_zones: [
    {
      id: "z1",
      name: "Floor - Front Stage",
      description: "Premium floor seats closest to the stage",
      price: 899,
      capacity: 2000,
      tickets_sold: 1950,
      color: "#E91E63",
    },
    {
      id: "z2",
      name: "Floor - General",
      description: "General floor admission",
      price: 499,
      capacity: 5000,
      tickets_sold: 4800,
      color: "#9C27B0",
    },
    {
      id: "z3",
      name: "Lower Bowl",
      description: "Lower level seating with great views",
      price: 349,
      capacity: 15000,
      tickets_sold: 14500,
      color: "#3F51B5",
    },
    {
      id: "z4",
      name: "Upper Bowl",
      description: "Upper level seating",
      price: 199,
      capacity: 28000,
      tickets_sold: 23750,
      color: "#00BCD4",
    },
  ],
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // In production, fetch from database
  return {
    title: `${mockEventData.title} | TicketFlow`,
    description: mockEventData.short_description,
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Try to fetch from database
  let event = null
  try {
    const { data } = await supabase
      .from("events")
      .select(
        `
        *,
        venue:venues(*),
        category:categories(*),
        organization:organizations(*),
        ticket_zones(*)
      `,
      )
      .eq("slug", slug)
      .single()
    event = data
  } catch {
    // Database not set up yet
  }

  // Use mock data if not found
  if (!event) {
    if (slug === mockEventData.slug) {
      event = mockEventData
    } else {
      notFound()
    }
  }

  const eventDate = new Date(event.start_date)
  const doorsOpen = event.doors_open ? new Date(event.doors_open) : null

  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const ticketsRemaining = event.total_capacity - event.tickets_sold
  const percentSold = Math.round((event.tickets_sold / event.total_capacity) * 100)

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
        <Image src={event.banner_url || event.image_url} alt={event.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back button */}
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
          <Link href="/events">
            <Button variant="secondary" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Button>
          </Link>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-6 left-4 sm:left-6">
          <Badge className="bg-primary text-primary-foreground">{event.category?.name}</Badge>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Title and meta */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>
              {event.short_description && (
                <p className="mt-2 text-lg text-muted-foreground">{event.short_description}</p>
              )}

              {/* Quick info */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>
                    {event.venue?.name}, {event.venue?.city}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-3">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Heart className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            <Separator className="my-8" />

            {/* About */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Info className="h-5 w-5 text-primary" />
                About This Event
              </h2>
              <div className="mt-4 whitespace-pre-line text-muted-foreground">{event.description}</div>
            </div>

            <Separator className="my-8" />

            {/* Venue info */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                Venue Information
              </h2>
              <div className="mt-4 rounded-xl border border-border/50 bg-card p-4">
                <h3 className="font-semibold">{event.venue?.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.venue?.address}
                  <br />
                  {event.venue?.city}, {event.venue?.state} {event.venue?.country}
                </p>
                {doorsOpen && (
                  <p className="mt-3 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    Doors open at{" "}
                    {doorsOpen.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative rounded-2xl border border-border/50 bg-card p-2">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <div className="relative rounded-xl bg-background p-6">
                  {/* Availability indicator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Availability</span>
                      <span className="font-medium">{percentSold}% sold</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        style={{ width: `${percentSold}%` }}
                      />
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {ticketsRemaining.toLocaleString()} tickets remaining
                    </p>
                  </div>

                  <Separator className="my-6" />

                  {/* Price range */}
                  <div className="mb-6 text-center">
                    <p className="text-sm text-muted-foreground">Price range</p>
                    <p className="text-2xl font-bold">
                      ${event.min_price} - ${event.max_price}
                    </p>
                  </div>

                  {/* Ticket zones */}
                  <TicketSelector event={event} ticketZones={event.ticket_zones || []} />
                </div>
              </div>

              {/* Organizer info */}
              <div className="mt-6 rounded-xl border border-border/50 bg-card p-4">
                <p className="text-xs text-muted-foreground">Presented by</p>
                <div className="mt-2 flex items-center gap-3">
                  {event.organization?.logo_url && (
                    <Image
                      src={event.organization.logo_url || "/placeholder.svg"}
                      alt={event.organization.name}
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  )}
                  <span className="font-medium">{event.organization?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
