import { CreateEventForm } from "@/components/organizer/create-event-form"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Create Event | Organizer Portal",
  description: "Create a new event",
}

export default async function CreateEventPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get organization
  const { data: organization } = await supabase.from("organizations").select("*").eq("owner_id", user?.id).single()

  // Get categories
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Get venues for this organization
  const { data: venues } = await supabase
    .from("venues")
    .select("*")
    .eq("organization_id", organization?.id)
    .order("name")

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground">Fill in the details to create your event</p>
      </div>

      <CreateEventForm organizationId={organization?.id || ""} categories={categories || []} venues={venues || []} />
    </div>
  )
}
