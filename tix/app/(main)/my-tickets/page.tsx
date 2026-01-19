import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketsList } from "@/components/tickets/tickets-list"
import { createClient } from "@/lib/supabase/server"
import { Ticket, Clock, CheckCircle2, XCircle } from "lucide-react"

export const metadata = {
  title: "My Tickets | TicketFlow",
  description: "View and manage your purchased tickets",
}

export default async function MyTicketsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login?redirect=/my-tickets")
  }

  // Fetch user's tickets
  let tickets: unknown[] = []
  try {
    const { data } = await supabase
      .from("tickets")
      .select(
        `
        *,
        event:events(*, venue:venues(*)),
        zone:ticket_zones(*)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    tickets = data || []
  } catch {
    // Database not set up yet
  }

  // Categorize tickets
  const now = new Date()
  const upcomingTickets = tickets.filter((t) => {
    const eventDate = new Date(t.event?.start_date || "")
    return t.status === "valid" && eventDate > now
  })
  const pastTickets = tickets.filter((t) => {
    const eventDate = new Date(t.event?.start_date || "")
    return eventDate <= now || t.status === "used"
  })
  const cancelledTickets = tickets.filter((t) => t.status === "cancelled" || t.status === "expired")

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your event tickets</p>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Upcoming</span>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs">{upcomingTickets.length}</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Past</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{pastTickets.length}</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2">
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Cancelled</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{cancelledTickets.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <TicketsList tickets={upcomingTickets} emptyMessage="No upcoming tickets" type="upcoming" />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <TicketsList tickets={pastTickets} emptyMessage="No past tickets" type="past" />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <TicketsList tickets={cancelledTickets} emptyMessage="No cancelled tickets" type="cancelled" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
