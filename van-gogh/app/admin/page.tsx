"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"

interface EventDate {
  id: string
  date: string
  is_available: boolean
}

interface TimeSlot {
  id: string
  event_date_id: string
  start_time: string
  end_time: string
  capacity: number
}

interface SKU {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  is_active: boolean
}

interface Inventory {
  id: string
  time_slot_id: string
  sku_id: string
  total_quantity: number
  available_quantity: number
}

export default function AdminDashboard() {
  const supabase = createClient()
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)
  const [dates, setDates] = useState<EventDate[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [skus, setSKUs] = useState<SKU[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [newDate, setNewDate] = useState("")
  const [selectedDateForSlots, setSelectedDateForSlots] = useState<string | null>(null)
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00")
  const [newSlotEndTime, setNewSlotEndTime] = useState("11:00")
  const [newSlotCapacity, setNewSlotCapacity] = useState("100")

  const [newSKUName, setNewSKUName] = useState("")
  const [newSKUDescription, setNewSKUDescription] = useState("")
  const [newSKUPrice, setNewSKUPrice] = useState("")
  const [newSKUCategory, setNewSKUCategory] = useState("")

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: eventData } = await supabase
          .from("events")
          .select("id")
          .eq("name", "Van Gogh – An Immersive Story")
          .single()

        if (eventData) {
          setEventId(eventData.id)

          // Load dates
          const { data: datesData } = await supabase
            .from("event_dates")
            .select("*")
            .eq("event_id", eventData.id)
            .order("date", { ascending: true })

          if (datesData) setDates(datesData)

          // Load time slots
          const { data: slotsData } = await supabase
            .from("time_slots")
            .select("*")
            .order("start_time", { ascending: true })

          if (slotsData) setTimeSlots(slotsData)

          // Load SKUs
          const { data: skusData } = await supabase.from("skus").select("*").eq("event_id", eventData.id)

          if (skusData) setSKUs(skusData)

          // Load inventory
          const { data: inventoryData } = await supabase.from("inventory").select("*")

          if (inventoryData) setInventory(inventoryData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  // Add new date
  const handleAddDate = async () => {
    if (!newDate || !eventId) return

    try {
      const { error } = await supabase.from("event_dates").insert({
        event_id: eventId,
        date: newDate,
        is_available: true,
      })

      if (error) throw error

      setNewDate("")

      // Reload dates
      const { data } = await supabase
        .from("event_dates")
        .select("*")
        .eq("event_id", eventId)
        .order("date", { ascending: true })

      if (data) setDates(data)
    } catch (error) {
      console.error("Error adding date:", error)
      alert("Failed to add date")
    }
  }

  // Add new time slot
  const handleAddTimeSlot = async () => {
    if (!selectedDateForSlots) return

    try {
      const { error } = await supabase.from("time_slots").insert({
        event_date_id: selectedDateForSlots,
        start_time: newSlotStartTime,
        end_time: newSlotEndTime,
        capacity: Number.parseInt(newSlotCapacity),
      })

      if (error) throw error

      setNewSlotStartTime("09:00")
      setNewSlotEndTime("11:00")
      setNewSlotCapacity("100")

      // Reload time slots
      const { data } = await supabase.from("time_slots").select("*").order("start_time", { ascending: true })

      if (data) setTimeSlots(data)
    } catch (error) {
      console.error("Error adding time slot:", error)
      alert("Failed to add time slot")
    }
  }

  // Add new SKU
  const handleAddSKU = async () => {
    if (!newSKUName || !newSKUPrice || !eventId) return

    try {
      const { error } = await supabase.from("skus").insert({
        event_id: eventId,
        name: newSKUName,
        description: newSKUDescription,
        base_price: Number.parseFloat(newSKUPrice),
        category: newSKUCategory,
        is_active: true,
      })

      if (error) throw error

      setNewSKUName("")
      setNewSKUDescription("")
      setNewSKUPrice("")
      setNewSKUCategory("")

      // Reload SKUs
      const { data } = await supabase.from("skus").select("*").eq("event_id", eventId)

      if (data) setSKUs(data)
    } catch (error) {
      console.error("Error adding SKU:", error)
      alert("Failed to add SKU")
    }
  }

  // Toggle date availability
  const handleToggleDateAvailability = async (dateId: string, currentState: boolean) => {
    try {
      const { error } = await supabase.from("event_dates").update({ is_available: !currentState }).eq("id", dateId)

      if (error) throw error

      setDates(dates.map((d) => (d.id === dateId ? { ...d, is_available: !currentState } : d)))
    } catch (error) {
      console.error("Error updating date:", error)
    }
  }

  // Delete date
  const handleDeleteDate = async (dateId: string) => {
    if (!confirm("Are you sure? This will delete all time slots for this date.")) return

    try {
      const { error } = await supabase.from("event_dates").delete().eq("id", dateId)

      if (error) throw error

      setDates(dates.filter((d) => d.id !== dateId))
    } catch (error) {
      console.error("Error deleting date:", error)
      alert("Failed to delete date")
    }
  }

  // Delete time slot
  const handleDeleteTimeSlot = async (slotId: string) => {
    if (!confirm("Are you sure? This will delete inventory for this slot.")) return

    try {
      const { error } = await supabase.from("time_slots").delete().eq("id", slotId)

      if (error) throw error

      setTimeSlots(timeSlots.filter((s) => s.id !== slotId))
    } catch (error) {
      console.error("Error deleting time slot:", error)
      alert("Failed to delete time slot")
    }
  }

  // Update inventory
  const handleUpdateInventory = async (invId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from("inventory")
        .update({ total_quantity: newQuantity, available_quantity: newQuantity })
        .eq("id", invId)

      if (error) throw error

      setInventory(
        inventory.map((inv) =>
          inv.id === invId ? { ...inv, total_quantity: newQuantity, available_quantity: newQuantity } : inv,
        ),
      )
    } catch (error) {
      console.error("Error updating inventory:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/80">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#1275d8"
            colorB="#e19136"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0066ff"
            upColor="#0066ff"
            downColor="#d1d1d1"
            leftColor="#e19136"
            rightColor="#e19136"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className={`relative z-10 px-4 py-12 md:px-8 transition-opacity duration-700 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-4 inline-block rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md">
              <p className="font-mono text-xs text-foreground/90">Admin Panel</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-lg text-foreground/90">Manage Van Gogh Expo events, dates, times, and inventory</p>
          </div>

        <Tabs defaultValue="dates" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dates">Dates</TabsTrigger>
            <TabsTrigger value="times">Time Slots</TabsTrigger>
            <TabsTrigger value="skus">Tickets</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          {/* Dates Tab */}
          <TabsContent value="dates">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle>Manage Event Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new date */}
                <div className="flex gap-4">
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 bg-card border-border/50"
                    placeholder="Select date"
                  />
                  <Button onClick={handleAddDate} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus className="h-4 w-4 mr-2" /> Add Date
                  </Button>
                </div>

                {/* Dates list */}
                <div className="space-y-2">
                  {dates.map((date) => {
                    const d = new Date(date.date)
                    const dateStr = d.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })

                    return (
                      <div
                        key={date.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50"
                      >
                        <div>
                          <p className="font-medium text-foreground">{dateStr}</p>
                          <p className="text-sm text-foreground/60">
                            {date.is_available ? "Available" : "Unavailable"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleDateAvailability(date.id, date.is_available)}
                            className="border-border/50"
                          >
                            {date.is_available ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDate(date.id)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Slots Tab */}
          <TabsContent value="times">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle>Manage Time Slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new time slot */}
                <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-card/50">
                  <div>
                    <Label className="text-foreground mb-2 block">Select Date</Label>
                    <select
                      value={selectedDateForSlots || ""}
                      onChange={(e) => setSelectedDateForSlots(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-card border border-border/50 text-foreground"
                    >
                      <option value="">Choose a date...</option>
                      {dates.map((date) => (
                        <option key={date.id} value={date.id}>
                          {new Date(date.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-foreground mb-2 block">Start Time</Label>
                      <Input
                        type="time"
                        value={newSlotStartTime}
                        onChange={(e) => setNewSlotStartTime(e.target.value)}
                        className="bg-card border-border/50"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground mb-2 block">End Time</Label>
                      <Input
                        type="time"
                        value={newSlotEndTime}
                        onChange={(e) => setNewSlotEndTime(e.target.value)}
                        className="bg-card border-border/50"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground mb-2 block">Capacity</Label>
                      <Input
                        type="number"
                        value={newSlotCapacity}
                        onChange={(e) => setNewSlotCapacity(e.target.value)}
                        className="bg-card border-border/50"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddTimeSlot}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Time Slot
                  </Button>
                </div>

                {/* Time slots list */}
                <div className="space-y-2">
                  {timeSlots.length === 0 ? (
                    <p className="text-foreground/60 text-center py-8">No time slots created yet</p>
                  ) : (
                    timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {slot.start_time} – {slot.end_time}
                          </p>
                          <p className="text-sm text-foreground/60">Capacity: {slot.capacity}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTimeSlot(slot.id)}
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SKUs Tab */}
          <TabsContent value="skus">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle>Manage Ticket Types (SKUs)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new SKU */}
                <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-card/50">
                  <div>
                    <Label className="text-foreground mb-2 block">Ticket Name</Label>
                    <Input
                      value={newSKUName}
                      onChange={(e) => setNewSKUName(e.target.value)}
                      placeholder="e.g., Individual Ticket, Group of 4"
                      className="bg-card border-border/50"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground mb-2 block">Description</Label>
                    <Input
                      value={newSKUDescription}
                      onChange={(e) => setNewSKUDescription(e.target.value)}
                      placeholder="e.g., Single admission to Van Gogh immersive experience"
                      className="bg-card border-border/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground mb-2 block">Price (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newSKUPrice}
                        onChange={(e) => setNewSKUPrice(e.target.value)}
                        placeholder="1200.00"
                        className="bg-card border-border/50"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground mb-2 block">Category</Label>
                      <Input
                        value={newSKUCategory}
                        onChange={(e) => setNewSKUCategory(e.target.value)}
                        placeholder="e.g., individual, group_4, group_5"
                        className="bg-card border-border/50"
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddSKU} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus className="h-4 w-4 mr-2" /> Add Ticket Type
                  </Button>
                </div>

                {/* SKUs list */}
                <div className="space-y-2">
                  {skus.map((sku) => (
                    <div
                      key={sku.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50"
                    >
                      <div>
                        <p className="font-medium text-foreground">{sku.name}</p>
                        <p className="text-sm text-foreground/60">{sku.description}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm font-semibold text-accent">₹{sku.base_price.toFixed(2)}</span>
                          <span className="text-sm text-foreground/60">{sku.category}</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{sku.is_active ? "Active" : "Inactive"}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle>Manage Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 font-semibold text-foreground">Time Slot</th>
                        <th className="text-left p-3 font-semibold text-foreground">Ticket Type</th>
                        <th className="text-center p-3 font-semibold text-foreground">Total</th>
                        <th className="text-center p-3 font-semibold text-foreground">Available</th>
                        <th className="text-center p-3 font-semibold text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-foreground/60">
                            No inventory records yet. Create time slots and SKUs first.
                          </td>
                        </tr>
                      ) : (
                        inventory.map((inv) => {
                          const slot = timeSlots.find((s) => s.id === inv.time_slot_id)
                          const sku = skus.find((s) => s.id === inv.sku_id)

                          return (
                            <tr key={inv.id} className="border-b border-border/30 hover:bg-card/30">
                              <td className="p-3 text-foreground">
                                {slot ? `${slot.start_time} – ${slot.end_time}` : "Unknown"}
                              </td>
                              <td className="p-3 text-foreground">{sku?.name || "Unknown"}</td>
                              <td className="p-3 text-center text-foreground">{inv.total_quantity}</td>
                              <td className="p-3 text-center text-foreground">{inv.available_quantity}</td>
                              <td className="p-3 text-center">
                                <Input
                                  type="number"
                                  value={inv.total_quantity}
                                  onChange={(e) => handleUpdateInventory(inv.id, Number.parseInt(e.target.value))}
                                  className="w-20 mx-auto bg-card border-border/50 text-center"
                                />
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </main>
  )
}
