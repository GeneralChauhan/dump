import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DollarSign, Ticket, Users, Calendar, TrendingUp, ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react"

export const metadata = {
  title: "Dashboard | Organizer Portal",
  description: "Manage your events and view analytics",
}

export default async function OrganizerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get organization
  const { data: organization } = await supabase.from("organizations").select("*").eq("owner_id", user?.id).single()

  // Get stats
  let stats = {
    totalRevenue: 0,
    ticketsSold: 0,
    totalAttendees: 0,
    activeEvents: 0,
  }

  let recentOrders: unknown[] = []
  let upcomingEvents: unknown[] = []

  if (organization) {
    // Get events
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .eq("organization_id", organization.id)
      .order("start_date", { ascending: true })

    if (events) {
      stats.activeEvents = events.filter((e) => e.status === "published").length
      stats.ticketsSold = events.reduce((sum, e) => sum + (e.tickets_sold || 0), 0)

      upcomingEvents = events.filter((e) => new Date(e.start_date) > new Date() && e.status === "published").slice(0, 5)
    }

    // Get orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*, event:events(*)")
      .in("event_id", events?.map((e) => e.id) || [])
      .order("created_at", { ascending: false })
      .limit(5)

    if (orders) {
      recentOrders = orders
      stats.totalRevenue = orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)
    }
  }

  // Mock data for demo
  if (stats.totalRevenue === 0) {
    stats = {
      totalRevenue: 45890,
      ticketsSold: 1234,
      totalAttendees: 1180,
      activeEvents: 5,
    }
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Tickets Sold",
      value: stats.ticketsSold.toLocaleString(),
      change: "+8.2%",
      trend: "up",
      icon: Ticket,
    },
    {
      title: "Total Attendees",
      value: stats.totalAttendees.toLocaleString(),
      change: "+15.3%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Active Events",
      value: stats.activeEvents.toString(),
      change: "-2",
      trend: "down",
      icon: Calendar,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">{"Here's an overview of your event performance"}</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest ticket purchases</CardDescription>
            </div>
            <Link href="/organizer/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map(
                  (order: {
                    id: string
                    created_at: string
                    total_amount: number
                    status: string
                    event?: { title: string }
                  }) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.event?.title || "Event"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total_amount?.toFixed(2)}</p>
                        <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No recent orders</p>
                <p className="text-sm">Orders will appear here once you start selling tickets</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your next scheduled events</CardDescription>
            </div>
            <Link href="/organizer/events">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(
                  (event: {
                    id: string
                    title: string
                    start_date: string
                    tickets_sold: number
                    total_capacity: number
                  }) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {event.tickets_sold}/{event.total_capacity}
                        </p>
                        <p className="text-xs text-muted-foreground">tickets sold</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No upcoming events</p>
                <Link href="/organizer/events/new">
                  <Button size="sm" className="mt-2">
                    Create Event
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/organizer/events/new">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                <Calendar className="h-6 w-6" />
                <span>Create Event</span>
              </Button>
            </Link>
            <Link href="/organizer/staff">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                <Users className="h-6 w-6" />
                <span>Manage Staff</span>
              </Button>
            </Link>
            <Link href="/organizer/analytics">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </Link>
            <Link href="/scanner">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                <Ticket className="h-6 w-6" />
                <span>Scan Tickets</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
