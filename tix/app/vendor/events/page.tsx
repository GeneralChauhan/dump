import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, MapPin, Users, Ticket, Edit, MoreHorizontal, PlusCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function VendorEventsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Redirect to login if not authenticated
    redirect("/vendor/login?redirect=/vendor/events")
  }

  // Fetch events for this vendor
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching events:", error)
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Ticket className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">My Events</span>
            </div>
            <Link href="/vendor">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </header>
        
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load your events. Please try refreshing the page or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  const eventsData = events || []
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">My Events</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/vendor/events/new">
              <Button>Create New Event</Button>
            </Link>
            <Link href="/vendor">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{eventsData.length}</p>
                    <p className="text-sm font-medium">Total Events</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {eventsData.reduce((sum: number, event: any) => sum + (event.tickets_sold || 0), 0)}
                    </p>
                    <p className="text-sm font-medium">Tickets Sold</p>
                  </div>
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      ${eventsData.reduce((sum: number, event: any) => sum + (event.revenue || 0), 0)}
                    </p>
                    <p className="text-sm font-medium">Total Revenue</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {eventsData.filter((event: any) => event.status === 'published').length}
                    </p>
                    <p className="text-sm font-medium">Published</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventsData.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium">{event.name}</h3>
                        <Badge variant={event.status === 'published' ? 'default' : 'outline'}>
                          {event.category}
                        </Badge>
                        <Badge variant={event.status === 'published' ? 'default' : 'outline'}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venue || 'No venue set'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {event.date || 'No date set'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Ticket className="h-4 w-4" />
                          {event.tickets_sold || 0}/{event.total_tickets || 0} sold
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/vendor/events/${event.id}/configure`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {eventsData.length === 0 && (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                      <PlusCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You haven't created any events yet. Start by creating your first event to begin selling tickets.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/vendor/events/new">
                        <Button className="px-6">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Your First Event
                        </Button>
                      </Link>
                      <Link href="/vendor">
                        <Button variant="outline">
                          Back to Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
