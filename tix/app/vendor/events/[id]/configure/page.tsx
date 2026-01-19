"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Upload, MapPin, Calendar, Clock, User, Users, Search, X, Edit, Image as ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EventData {
  id: string
  name: string
  category: string
  sub_category: string
  genre: string
  venue?: string
  date?: string
  time?: string
  language?: string
  age_limit?: string
  duration?: string
  horizontal_banner?: string
  vertical_poster?: string
}

export default function EventConfigurePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState({
    venue: "",
    date: "",
    time: "",
    language: "",
    ageLimit: "",
    duration: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [horizontalBanner, setHorizontalBanner] = useState<File | null>(null)
  const [verticalPoster, setVerticalPoster] = useState<File | null>(null)

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) throw error
      
      setEvent(data)
      setFormData({
        venue: data.venue || "",
        date: data.date || "",
        time: data.time || "",
        language: data.language || "",
        ageLimit: data.age_limit || "",
        duration: data.duration || ""
      })
    } catch (error) {
      console.error("Error fetching event:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (type: "horizontal" | "vertical", file: File) => {
    if (type === "horizontal") {
      setHorizontalBanner(file)
    } else {
      setVerticalPoster(file)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("events")
        .update({
          venue: formData.venue,
          date: formData.date,
          time: formData.time,
          language: formData.language,
          age_limit: formData.ageLimit,
          duration: formData.duration,
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id)

      if (error) throw error
      
      router.push("/vendor/events")
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">Event not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">{event.name}</span>
              <p className="text-sm text-muted-foreground">{event.category.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Preview</Button>
            <Button variant="ghost" onClick={() => router.push("/vendor")}>
              Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Alert */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Alert>
          <AlertDescription>
            Awesome! Your event is created. We need the following details to make this event happen.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button
                    variant={activeTab === "details" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("details")}
                  >
                    Event Details
                  </Button>
                  <Button
                    variant={activeTab === "tickets" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("tickets")}
                  >
                    Tickets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="details" className="space-y-6">
                {/* Event Name & Category */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Event Name & Category</CardTitle>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        EDIT
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{event.category}</p>
                      <p className="text-xl font-bold">{event.name}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Add Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add Images</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Changes to event name or banner image will be sent for review
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Horizontal Banner */}
                    <div>
                      <Label className="text-base font-medium">Horizontal Banner</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Minimum 1280 x 640, aspect ratio 2:1, max 1MB
                      </p>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                           onClick={() => document.getElementById('horizontal-upload')?.click()}>
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Header Image</p>
                        <input
                          id="horizontal-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload("horizontal", e.target.files[0])}
                        />
                      </div>
                      {horizontalBanner && (
                        <div className="mt-2 flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{horizontalBanner.name}</span>
                          <X className="h-4 w-4 cursor-pointer" onClick={() => setHorizontalBanner(null)} />
                        </div>
                      )}
                    </div>

                    {/* Vertical Poster */}
                    <div>
                      <Label className="text-base font-medium">Vertical Poster</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Minimum 500 x 750, aspect ratio 1:1.5, max 1MB
                      </p>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                           onClick={() => document.getElementById('vertical-upload')?.click()}>
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Vertical Poster</p>
                        <input
                          id="vertical-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload("vertical", e.target.files[0])}
                        />
                      </div>
                      {verticalPoster && (
                        <div className="mt-2 flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{verticalPoster.name}</span>
                          <X className="h-4 w-4 cursor-pointer" onClick={() => setVerticalPoster(null)} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Ad Banners */}
                <Card>
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-2">Ad Banners</h3>
                      <p className="text-muted-foreground mb-4">
                        Want to promote your event on BookMyShow? Write to us at{' '}
                        <span className="text-primary">eventads@bookmyshow.com</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Starting from ₹6000
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Select a venue */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select a venue</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="border-destructive/50 text-destructive">
                      <AlertDescription>
                        Your venue has been deleted as it was 15 days old. Please select a venue before adding new shows.
                      </AlertDescription>
                    </Alert>
                    <div className="relative">
                      <Input
                        placeholder="Pick a venue from our directory"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="pl-10"
                      />
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Input
                        placeholder="Pick a venue from our directory"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="pl-10"
                      />
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="pl-10"
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Input
                        placeholder="Select Language (Optional)"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="Set age limit for the audience (Optional)"
                        value={formData.ageLimit}
                        onChange={(e) => setFormData({ ...formData, ageLimit: e.target.value })}
                        className="pl-10"
                      />
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="Enter duration in minutes *"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="pl-10"
                      />
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Artist & Crew */}
                <Card>
                  <CardHeader>
                    <CardTitle>Artist & Crew</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Artist and crew management coming soon...</p>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="px-8">
                    Save Changes
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="tickets">
                <Card>
                  <CardContent className="p-8">
                    <p className="text-muted-foreground">Ticket management coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
