import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrganizerSidebar } from "@/components/organizer/sidebar"
import { OrganizerHeader } from "@/components/organizer/header"

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login?redirect=/organizer")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is an organizer
  if (profile?.role !== "organizer" && profile?.role !== "admin") {
    // Redirect to become an organizer
    redirect("/organizer/onboarding")
  }

  // Get user's organization
  const { data: organization } = await supabase.from("organizations").select("*").eq("owner_id", user.id).single()

  if (!organization) {
    redirect("/organizer/onboarding")
  }

  return (
    <div className="flex min-h-screen">
      <OrganizerSidebar organization={organization} />
      <div className="flex flex-1 flex-col">
        <OrganizerHeader user={user} profile={profile} organization={organization} />
        <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}
