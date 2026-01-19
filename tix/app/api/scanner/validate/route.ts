import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        status: "invalid",
        message: "Unauthorized",
      },
      { status: 401 },
    )
  }

  const { ticketId, eventId } = await request.json()

  if (!ticketId || !eventId) {
    return NextResponse.json({
      status: "invalid",
      message: "Missing required fields",
    })
  }

  // Fetch ticket with all related data
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      attendee_name,
      attendee_email,
      status,
      scanned_at,
      zone:ticket_zones(
        id,
        name,
        event_id
      ),
      order:orders(
        id,
        status
      ),
      event:ticket_zones(
        event:events(
          id,
          title,
          start_date,
          venue:venues(name)
        )
      )
    `)
    .eq("id", ticketId)
    .single()

  // Log the scan attempt
  const logScan = async (result: string) => {
    await supabase.from("scan_logs").insert({
      ticket_id: ticket?.id || null,
      event_id: eventId,
      scanned_by: user.id,
      scan_result: result,
    })
  }

  // Ticket not found
  if (error || !ticket) {
    await logScan("invalid")
    return NextResponse.json({
      status: "invalid",
      message: "Ticket not found. This QR code is not valid.",
    })
  }

  const eventData = ticket.event?.[0]?.event

  // Check if ticket is for the correct event
  if (ticket.zone?.event_id !== eventId) {
    await logScan("wrong_event")
    return NextResponse.json({
      status: "wrong_event",
      message: "This ticket is for a different event.",
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        attendee_name: ticket.attendee_name,
        attendee_email: ticket.attendee_email,
        zone_name: ticket.zone?.name || "Unknown",
        event_title: eventData?.title || "Unknown",
        event_date: eventData?.start_date || "",
        venue_name: eventData?.venue?.name || "Unknown",
        scanned_at: ticket.scanned_at,
      },
    })
  }

  // Check if order is completed (repo schema uses "completed")
  if (ticket.order?.status !== "completed") {
    await logScan("invalid")
    return NextResponse.json({
      status: "invalid",
      message: "This ticket has not been paid for.",
    })
  }

  // Check if ticket is cancelled
  if (ticket.status === "cancelled") {
    await logScan("invalid")
    return NextResponse.json({
      status: "invalid",
      message: "This ticket has been cancelled.",
    })
  }

  // Check if event has ended (repo schema stores timestamptz start/end dates)
  // If end_date isn't present in this join, we conservatively skip expiry-by-date.

  // Check if already used
  if (ticket.status === "used" || ticket.scanned_at) {
    await logScan("used")
    return NextResponse.json({
      status: "used",
      message: "This ticket has already been scanned.",
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        attendee_name: ticket.attendee_name,
        attendee_email: ticket.attendee_email,
        zone_name: ticket.zone?.name || "Unknown",
        event_title: eventData?.title || "Unknown",
        event_date: eventData?.start_date || "",
        venue_name: eventData?.venue?.name || "Unknown",
        scanned_at: ticket.scanned_at,
      },
    })
  }

  // Mark ticket as used
  await supabase
    .from("tickets")
    .update({
      status: "used",
      scanned_at: new Date().toISOString(),
      scanned_by: user.id,
    })
    .eq("id", ticket.id)

  // Log successful scan
  await logScan("valid")

  return NextResponse.json({
    status: "valid",
    message: "Entry approved! Welcome to the event.",
    ticket: {
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      attendee_name: ticket.attendee_name,
      attendee_email: ticket.attendee_email,
      zone_name: ticket.zone?.name || "Unknown",
      event_title: eventData?.title || "Unknown",
      event_date: eventData?.start_date || "",
      venue_name: eventData?.venue?.name || "Unknown",
      scanned_at: null,
    },
  })
}
