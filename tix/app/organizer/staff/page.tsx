import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Users, Mail, Shield } from "lucide-react"
import { AddStaffDialog } from "@/components/organizer/add-staff-dialog"

export const metadata = {
  title: "Staff Management | Organizer Portal",
  description: "Manage your event staff",
}

export default async function StaffPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get organization
  const { data: organization } = await supabase.from("organizations").select("*").eq("owner_id", user?.id).single()

  // Get staff members
  let staffMembers: unknown[] = []
  if (organization) {
    const { data } = await supabase
      .from("staff_members")
      .select(
        `
        *,
        profile:profiles(*)
      `,
      )
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })

    staffMembers = data || []
  }

  const roleColors: Record<string, string> = {
    scanner: "bg-blue-500/10 text-blue-500",
    manager: "bg-purple-500/10 text-purple-500",
    admin: "bg-primary/10 text-primary",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage team members who can scan tickets at your events</p>
        </div>
        <AddStaffDialog organizationId={organization?.id || ""}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </AddStaffDialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search staff..." className="pl-9" />
      </div>

      {/* Staff list */}
      {staffMembers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staffMembers.map(
            (member: {
              id: string
              role: string
              created_at: string
              profile?: { full_name?: string; email?: string }
            }) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{member.profile?.full_name || "Staff Member"}</h3>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.profile?.email || "No email"}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className={roleColors[member.role]}>
                          <Shield className="mr-1 h-3 w-3" />
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>No Staff Members Yet</CardTitle>
            <CardDescription>
              Add staff members who can scan tickets and check in attendees at your events
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <AddStaffDialog organizationId={organization?.id || ""}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Staff Member
              </Button>
            </AddStaffDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
