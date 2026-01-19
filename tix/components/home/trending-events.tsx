import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ArrowRight, TrendingUp, Clock } from "lucide-react"

const trendingEvents = [
  {
    id: "4",
    title: "Coldplay - Music of the Spheres",
    slug: "coldplay-music-spheres",
    image: "/coldplay-concert-colorful-lights.jpg",
    date: "May 10, 2025",
    venue: "MetLife Stadium",
    city: "East Rutherford, NJ",
    minPrice: 149,
    category: "Concerts",
    ticketsLeft: 234,
  },
  {
    id: "5",
    title: "UFC 310 - Championship Fight",
    slug: "ufc-310",
    image: "/ufc-mma-octagon-arena.jpg",
    date: "Apr 20, 2025",
    venue: "T-Mobile Arena",
    city: "Las Vegas, NV",
    minPrice: 275,
    category: "Sports",
    ticketsLeft: 89,
  },
  {
    id: "6",
    title: "Kevin Hart - Reality Check Tour",
    slug: "kevin-hart-tour",
    image: "/comedy-show-stage-spotlight.jpg",
    date: "Mar 28, 2025",
    venue: "The Forum",
    city: "Los Angeles, CA",
    minPrice: 89,
    category: "Comedy",
    ticketsLeft: 156,
  },
  {
    id: "7",
    title: "Coachella 2025 - Weekend 1",
    slug: "coachella-2025",
    image: "/coachella-music-festival-desert.jpg",
    date: "Apr 11-13, 2025",
    venue: "Empire Polo Club",
    city: "Indio, CA",
    minPrice: 499,
    category: "Festivals",
    ticketsLeft: 45,
  },
]

export function TrendingEvents() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trending Now</h2>
              <p className="text-muted-foreground">Events selling fast this week</p>
            </div>
          </div>
          <Link href="/events?sort=trending" className="hidden sm:block">
            <Button variant="ghost" className="gap-2">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Events list */}
        <div className="mt-10 space-y-4">
          {trendingEvents.map((event, index) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="group block">
              <div className="flex gap-4 rounded-2xl border border-border/50 bg-card/50 p-3 transition-all hover:border-primary/50 hover:bg-card sm:gap-6 sm:p-4">
                {/* Rank */}
                <div className="hidden items-center justify-center sm:flex">
                  <span className="text-3xl font-bold text-muted-foreground/50">#{index + 1}</span>
                </div>

                {/* Image */}
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold leading-tight group-hover:text-primary sm:text-lg">{event.title}</h3>
                      <Badge variant="secondary" className="shrink-0">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.venue}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">From</span>
                      <span className="font-semibold text-primary">${event.minPrice}</span>
                    </div>
                    {event.ticketsLeft < 100 && (
                      <div className="flex items-center gap-1.5 text-sm text-orange-500">
                        <Clock className="h-3.5 w-3.5" />
                        Only {event.ticketsLeft} left!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/events?sort=trending">
            <Button variant="outline" className="gap-2 bg-transparent">
              View all trending
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
