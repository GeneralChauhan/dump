import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      `
      *,
      event:events(*, venue:venues(*), organization:organizations(*)),
      zone:ticket_zones(*)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
  }

  // Only allow ticket owner or event organizer to view
  if (ticket.user_id !== user.id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", ticket.event?.organization_id)
      .single()

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  return NextResponse.json(ticket)
}
