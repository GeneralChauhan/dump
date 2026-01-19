import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Ticket, Calendar, TrendingUp, Users, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Dashboard | Vendor Portal",
  description: "Manage your vendor account and view analytics",
}

export default async function VendorDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/vendor/login?redirect=/vendor")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const statsCards = [
    {
      title: "Total Events",
      value: "0",
      icon: Calendar,
      description: "Events you've created",
    },
    {
      title: "Tickets Sold",
      value: "0",
      icon: Ticket,
      description: "Total tickets sold",
    },
    {
      title: "Total Revenue",
      value: "$0",
      icon: TrendingUp,
      description: "Your earnings",
    },
    {
      title: "Active Listings",
      value: "0",
      icon: Users,
      description: "Currently active",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">TicketFlow Vendor</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{profile?.full_name || user?.email}</span>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Welcome */}
          <div>
            <h1 className="text-3xl font-bold">Welcome to Vendor Portal</h1>
            <p className="text-muted-foreground">Manage your events and track your performance</p>
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
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm font-medium">{stat.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your vendor account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/vendor/events/new">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                    <Calendar className="h-6 w-6" />
                    <span>Create Event</span>
                  </Button>
                </Link>
                <Link href="/vendor/events">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                    <Ticket className="h-6 w-6" />
                    <span>My Events</span>
                  </Button>
                </Link>
                <Link href="/vendor/analytics">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                    <TrendingUp className="h-6 w-6" />
                    <span>View Analytics</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Complete your vendor profile to start selling tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Complete your profile</p>
                    <p className="text-sm text-muted-foreground">Add your business details and verification documents</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Get Started
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

