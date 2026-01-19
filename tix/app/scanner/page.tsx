import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ScannerInterface } from "@/components/scanner/scanner-interface"

export default async function ScannerPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/scanner/login")
  }

  // Check if user is a staff member
  const { data: staffMember } = await supabase
    .from("staff_members")
    .select(`
      *,
      organization:organizations(id, name, logo_url)
    `)
    .eq("user_id", user.id)
    .single()

  if (!staffMember) {
    redirect("/scanner/login?error=not_staff")
  }

  // Get events for this organization
  const { data: events } = await supabase
    .from("events")
    .select("id, title, start_date, venue:venues(name)")
    .eq("organization_id", staffMember.organization_id)
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })

  return <ScannerInterface staffMember={staffMember} events={events || []} />
}
