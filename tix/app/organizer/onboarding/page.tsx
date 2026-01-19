import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "@/components/organizer/onboarding-form"

export const metadata = {
  title: "Become an Organizer | TicketFlow",
  description: "Set up your organization to start selling tickets",
}

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/organizer/onboarding")
  }

  // Check if user already has an organization
  const { data: existingOrg } = await supabase.from("organizations").select("*").eq("owner_id", user.id).single()

  if (existingOrg) {
    redirect("/organizer")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Become an Organizer</h1>
          <p className="mt-2 text-muted-foreground">Set up your organization to start creating and selling tickets</p>
        </div>

        <OnboardingForm userId={user.id} userEmail={user.email || ""} />
      </div>
    </div>
  )
}
