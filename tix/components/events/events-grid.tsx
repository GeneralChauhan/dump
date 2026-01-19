import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Calendar, MapPin, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

// Mock events for when database is empty
const mockEvents = [
  {
    id: "1",
    title: "Taylor Swift | The Eras Tour",
    slug: "taylor-swift-eras-tour",
    image_url: "/taylor-swift-concert-stage-lights.jpg",
    start_date: "2025-03-15T19:00:00Z",
    min_price: 199,
    venue: { name: "SoFi Stadium", city: "Los Angeles", state: "CA" },
    category: { name: "Concerts", slug: "concerts" },
    tickets_sold: 45000,
    total_capacity: 50000,
  },
  {
    id: "2",
    title: "NBA Finals 2025 - Game 7",
    slug: "nba-finals-2025",
    image_url: "/basketball-arena-nba-finals.jpg",
    start_date: "2025-06-22T20:00:00Z",
    min_price: 350,
    venue: { name: "Madison Square Garden", city: "New York", state: "NY" },
    category: { name: "Sports", slug: "sports" },
    tickets_sold: 18000,
    total_capacity: 20000,
  },
  {
    id: "3",
    title: "Hamilton - Broadway",
    slug: "hamilton-broadway",
    image_url: "/hamilton-broadway-theater-stage.jpg",
    start_date: "2025-04-05T19:30:00Z",
    min_price: 179,
    venue: { name: "Richard Rodgers Theatre", city: "New York", state: "NY" },
    category: { name: "Theater", slug: "theater" },
    tickets_sold: 1200,
    total_capacity: 1400,
  },
  {
    id: "4",
    title: "Coldplay - Music of the Spheres",
    slug: "coldplay-music-spheres",
    image_url: "/coldplay-concert-colorful-lights.jpg",
    start_date: "2025-05-10T20:00:00Z",
    min_price: 149,
    venue: { name: "MetLife Stadium", city: "East Rutherford", state: "NJ" },
    category: { name: "Concerts", slug: "concerts" },
    tickets_sold: 35000,
    total_capacity: 40000,
  },
  {
    id: "5",
    title: "Kevin Hart - Reality Check Tour",
    slug: "kevin-hart-tour",
    image_url: "/comedy-show-stage-spotlight.jpg",
    start_date: "2025-03-28T20:00:00Z",
    min_price: 89,
    venue: { name: "The Forum", city: "Los Angeles", state: "CA" },
    category: { name: "Comedy", slug: "comedy" },
    tickets_sold: 8500,
    total_capacity: 10000,
  },
  {
    id: "6",
    title: "Coachella 2025 - Weekend 1",
    slug: "coachella-2025",
    image_url: "/coachella-music-festival-desert-sunset.jpg",
    start_date: "2025-04-11T12:00:00Z",
    min_price: 499,
    venue: { name: "Empire Polo Club", city: "Indio", state: "CA" },
    category: { name: "Festivals", slug: "festivals" },
    tickets_sold: 95000,
    total_capacity: 100000,
  },
]

interface EventsGridProps {
  category?: string
  search?: string
  sort?: string
  date?: string
}

export async function EventsGrid({ category, search, sort, date }: EventsGridProps) {
  const supabase = await createClient()

  // Try to fetch from database
  let events = []
  try {
    let query = supabase
      .from("events")
      .select(
        `
        *,
        venue:venues(*),
        category:categories(*)
      `,
      )
      .eq("status", "published")

    if (category) {
      query = query.eq("category.slug", category)
    }

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data } = await query.limit(20)
    events = data || []
  } catch {
    // Database not set up yet, use mock data
  }

  // Use mock data if no events in database
  if (events.length === 0) {
    events = mockEvents

    // Filter mock data
    if (category) {
      events = events.filter((e) => e.category?.slug === category)
    }
    if (search) {
      events = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
    }
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="text-4xl">🎫</div>
        <h3 className="mt-4 text-lg font-semibold">No events found</h3>
        <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">{events.length} events found</p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: (typeof mockEvents)[0] }) {
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

  const ticketsRemaining = event.total_capacity - event.tickets_sold
  const isLowStock = ticketsRemaining < event.total_capacity * 0.1

  return (
    <Link href={`/events/${event.slug}`} className="group">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-2 transition-all hover:border-primary/50">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
        <div className="relative">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={event.image_url || "/placeholder.svg?height=400&width=600"}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Category badge */}
            <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground hover:bg-primary">
              {event.category?.name || "Event"}
            </Badge>

            {/* Low stock warning */}
            {isLowStock && (
              <Badge variant="destructive" className="absolute right-3 top-3">
                <Clock className="mr-1 h-3 w-3" />
                Selling Fast
              </Badge>
            )}

            {/* Price */}
            <div className="absolute bottom-3 right-3 rounded-lg bg-background/90 px-3 py-1.5 backdrop-blur">
              <span className="text-sm text-muted-foreground">From </span>
              <span className="font-semibold text-foreground">${event.min_price}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary">{event.title}</h3>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {formattedDate} at {formattedTime}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {event.venue?.name}, {event.venue?.city}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
