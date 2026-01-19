import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Calendar, MapPin, Ticket, Edit, Eye, Trash2 } from "lucide-react"

export const metadata = {
  title: "Events | Organizer Portal",
  description: "Manage your events",
}

// Mock events for demo
const mockEvents = [
  {
    id: "1",
    title: "Summer Music Festival 2025",
    slug: "summer-music-festival-2025",
    image_url: "/vibrant-music-festival.png",
    start_date: "2025-07-15T14:00:00Z",
    status: "published",
    tickets_sold: 2500,
    total_capacity: 5000,
    venue: { name: "Central Park", city: "New York" },
  },
  {
    id: "2",
    title: "Tech Conference 2025",
    slug: "tech-conference-2025",
    image_url: "/tech-conference.png",
    start_date: "2025-09-20T09:00:00Z",
    status: "draft",
    tickets_sold: 0,
    total_capacity: 1000,
    venue: { name: "Convention Center", city: "San Francisco" },
  },
  {
    id: "3",
    title: "Comedy Night Special",
    slug: "comedy-night-special",
    image_url: "/comedy-show.png",
    start_date: "2025-04-10T20:00:00Z",
    status: "published",
    tickets_sold: 180,
    total_capacity: 200,
    venue: { name: "Laugh Factory", city: "Los Angeles" },
  },
]

export default async function EventsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let events: typeof mockEvents = []

  if (user) {
    const { data: organization } = await supabase.from("organizations").select("*").eq("owner_id", user.id).single()

    if (organization) {
      const { data } = await supabase
        .from("events")
        .select("*, venue:venues(*)")
        .eq("organization_id", organization.id)
        .order("start_date", { ascending: false })

      events = (data as typeof mockEvents) || []
    }
  }

  // Use mock data if no events
  if (events.length === 0) {
    events = mockEvents
  }

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-500/10 text-green-500",
    cancelled: "bg-destructive/10 text-destructive",
    completed: "bg-blue-500/10 text-blue-500",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Create and manage your events</p>
        </div>
        <Link href="/organizer/events/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-9" />
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {events.map((event) => {
          const eventDate = new Date(event.start_date)
          const isPast = eventDate < new Date()
          const percentSold = Math.round((event.tickets_sold / event.total_capacity) * 100)

          return (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative h-40 w-full sm:h-auto sm:w-48">
                    <Image
                      src={event.image_url || "/placeholder.svg?height=200&width=300"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {eventDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            {event.venue && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {event.venue.name}, {event.venue.city}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[event.status]}>{event.status}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/organizer/events/${event.id}`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/events/${event.slug}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Public Page
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Ticket className="h-4 w-4 text-primary" />
                          <span className="font-medium">{event.tickets_sold}</span>
                          <span className="text-muted-foreground">/ {event.total_capacity} sold</span>
                        </div>
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${percentSold}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground">{percentSold}%</span>
                      </div>
                      {!isPast && event.status === "published" && (
                        <Link href={`/organizer/events/${event.id}/check-in`}>
                          <Button size="sm" variant="outline">
                            Check-in Mode
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
