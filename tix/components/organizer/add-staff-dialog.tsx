"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AddStaffDialogProps {
  organizationId: string
  children: React.ReactNode
}

export function AddStaffDialog({ organizationId, children }: AddStaffDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("scanner")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1)

      if (profileError) throw profileError

      if (!profiles || profiles.length === 0) {
        throw new Error("No user found with this email. They need to create an account first.")
      }

      // Add as staff member
      const { error: staffError } = await supabase.from("staff_members").insert({
        user_id: profiles[0].id,
        organization_id: organizationId,
        role: role,
      })

      if (staffError) {
        if (staffError.code === "23505") {
          throw new Error("This user is already a staff member")
        }
        throw staffError
      }

      // Update user's profile role
      await supabase
        .from("profiles")
        .update({ role: "staff", organization_id: organizationId })
        .eq("id", profiles[0].id)

      setOpen(false)
      setEmail("")
      setRole("scanner")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add staff member")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            Invite a team member to help manage your events. They need to have an existing TicketFlow account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="staff@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scanner">Scanner - Can scan tickets at events</SelectItem>
                <SelectItem value="manager">Manager - Can manage events and view analytics</SelectItem>
                <SelectItem value="admin">Admin - Full access to organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Staff Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
