"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Category, Venue } from "@/lib/types"

interface TicketZoneInput {
  name: string
  description: string
  price: string
  capacity: string
  color: string
}

interface CreateEventFormProps {
  organizationId: string
  categories: Category[]
  venues: Venue[]
}

export function CreateEventForm({ organizationId, categories, venues }: CreateEventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    venueId: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    doorsOpenTime: "",
  })

  const [ticketZones, setTicketZones] = useState<TicketZoneInput[]>([
    { name: "General Admission", description: "", price: "", capacity: "", color: "#3B82F6" },
  ])

  const addTicketZone = () => {
    setTicketZones([
      ...ticketZones,
      {
        name: "",
        description: "",
        price: "",
        capacity: "",
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      },
    ])
  }

  const removeTicketZone = (index: number) => {
    setTicketZones(ticketZones.filter((_, i) => i !== index))
  }

  const updateTicketZone = (index: number, field: keyof TicketZoneInput, value: string) => {
    const updated = [...ticketZones]
    updated[index][field] = value
    setTicketZones(updated)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Validate
      if (!formData.title || !formData.startDate || !formData.startTime) {
        throw new Error("Please fill in all required fields")
      }

      if (ticketZones.length === 0) {
        throw new Error("Please add at least one ticket type")
      }

      // Calculate total capacity and price range
      const totalCapacity = ticketZones.reduce((sum, z) => sum + (Number.parseInt(z.capacity) || 0), 0)
      const prices = ticketZones.map((z) => Number.parseFloat(z.price) || 0)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)

      // Create start/end dates
      const startDate = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDate = formData.endDate && formData.endTime ? new Date(`${formData.endDate}T${formData.endTime}`) : null
      const doorsOpen = formData.doorsOpenTime ? new Date(`${formData.startDate}T${formData.doorsOpenTime}`) : null

      // Create event
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          title: formData.title,
          slug: generateSlug(formData.title) + "-" + Date.now(),
          description: formData.description,
          short_description: formData.shortDescription,
          category_id: formData.categoryId || null,
          venue_id: formData.venueId || null,
          organization_id: organizationId,
          start_date: startDate.toISOString(),
          end_date: endDate?.toISOString() || null,
          doors_open: doorsOpen?.toISOString() || null,
          status: "draft",
          total_capacity: totalCapacity,
          min_price: minPrice,
          max_price: maxPrice,
        })
        .select()
        .single()

      if (eventError) throw eventError

      // Create ticket zones
      const zones = ticketZones.map((zone, index) => ({
        event_id: event.id,
        name: zone.name,
        description: zone.description,
        price: Number.parseFloat(zone.price) || 0,
        capacity: Number.parseInt(zone.capacity) || 0,
        color: zone.color,
        sort_order: index,
      }))

      const { error: zonesError } = await supabase.from("ticket_zones").insert(zones)
      if (zonesError) throw zonesError

      router.push(`/organizer/events/${event.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>The main details about your event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Summer Music Festival 2025"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="A brief tagline for your event"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event in detail..."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="venue">Venue</Label>
              <Select value={formData.venueId} onValueChange={(value) => setFormData({ ...formData, venueId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add new venue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date and time */}
      <Card>
        <CardHeader>
          <CardTitle>Date & Time</CardTitle>
          <CardDescription>When your event takes place</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:w-1/2">
            <Label htmlFor="doorsOpenTime">Doors Open</Label>
            <Input
              id="doorsOpenTime"
              type="time"
              value={formData.doorsOpenTime}
              onChange={(e) => setFormData({ ...formData, doorsOpenTime: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ticket types */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Types</CardTitle>
          <CardDescription>Define different ticket tiers for your event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticketZones.map((zone, index) => (
            <div key={index} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: zone.color }} />
                  <span className="font-medium">Ticket Type {index + 1}</span>
                </div>
                {ticketZones.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTicketZone(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Name *</Label>
                  <Input
                    placeholder="e.g., VIP, General Admission"
                    value={zone.name}
                    onChange={(e) => updateTicketZone(index, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="What's included"
                    value={zone.description}
                    onChange={(e) => updateTicketZone(index, "description", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={zone.price}
                    onChange={(e) => updateTicketZone(index, "price", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Capacity *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Number of tickets"
                    value={zone.capacity}
                    onChange={(e) => updateTicketZone(index, "capacity", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addTicketZone} className="w-full gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            Add Ticket Type
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Event
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
          Cancel
        </Button>
      </div>
    </form>
  )
}
