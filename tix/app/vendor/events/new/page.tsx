"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Check, Search, Calendar, MapPin, Clock, User, Users, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EventFormData {
  name: string
  category: string
  subCategory: string
  genre: string
  venue: string
  date: string
  time: string
  language: string
  ageLimit: string
  duration: string
  artists: string[]
  description: string
}

const categories = [
  "Music Shows", "Theatre", "Sports", "Comedy", "Workshops", "Exhibitions", "Conferences"
]

const subCategories = {
  "Music Shows": ["Concert", "Festival", "DJ Night", "Classical", "Rock", "Pop", "Jazz"],
  "Theatre": ["Drama", "Musical", "Comedy Play", "Monologue", "Improv"],
  "Sports": ["Cricket", "Football", "Tennis", "Badminton", "Marathon", "Esports"],
  "Comedy": ["Stand-up", "Open Mic", "Gala Show", "Improv Comedy"],
  "Workshops": ["Art", "Music", "Dance", "Photography", "Writing", "Coding"],
  "Exhibitions": ["Art", "Photography", "Science", "History", "Technology"],
  "Conferences": ["Tech", "Business", "Design", "Marketing", "Startup"]
}

const genres = [
  "Rock", "Pop", "Jazz", "Classical", "Electronic", "Hip Hop", "Country", "Blues", "Reggae", "Metal"
]

export default function CreateEventPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    category: "",
    subCategory: "",
    genre: "",
    venue: "",
    date: "",
    time: "",
    language: "",
    ageLimit: "",
    duration: "",
    artists: [],
    description: ""
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Event name is required"
      if (!selectedCategory) newErrors.category = "Category is required"
      if (!selectedSubCategory) newErrors.subCategory = "This field cannot be empty"
      if (!selectedGenre) newErrors.genre = "This field cannot be empty"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 2) {
        setStep(step + 1)
      } else {
        // Submit on final step
        handleSubmit()
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/vendor/login")
        return
      }

      const { data, error } = await supabase
        .from("events")
        .insert({
          name: formData.name,
          category: selectedCategory,
          sub_category: selectedSubCategory,
          genre: selectedGenre,
          vendor_id: user.id,
          status: "draft"
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/vendor/events/${data.id}/configure`)
    } catch (error) {
      console.error("Error creating event:", error)
    }
  }

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Additional Event Details</h2>
        <p className="text-muted-foreground">Let's add more information and images for your event</p>
      </div>

      <div className="space-y-6">
        {/* Additional Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Info</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language" className="mb-2">Select Language (Optional)</Label>
                <div className="relative">
                  <Input
                    id="language"
                    placeholder="Search for language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ageLimit" className="mb-2">Set age limit for the audience (Optional)</Label>
                <div className="relative">
                  <Input
                    id="ageLimit"
                    placeholder="e.g., 18+, 21+, All ages"
                    value={formData.ageLimit}
                    onChange={(e) => setFormData({ ...formData, ageLimit: e.target.value })}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="duration" className="mb-2">Enter duration in minutes *</Label>
                <div className="relative">
                  <Input
                    id="duration"
                    placeholder="e.g., 120"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className={errors.duration ? "border-destructive pr-10" : "pr-10"}
                  />
                  <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.duration && <p className="text-sm text-destructive mt-1">{errors.duration}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artist & Crew */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Artist & Crew</h3>
            <Alert className="mb-4">
              <AlertDescription>
                Currently you can only pick artists & crew from our directory of 1.2 lac professionals
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="artists" className="mb-2">Search for artists & crew (Optional)</Label>
              <div className="relative">
                <Input
                  id="artists"
                  placeholder="Search for artists, performers, crew..."
                  value={formData.artists.join(", ")}
                  onChange={(e) => setFormData({ ...formData, artists: e.target.value.split(",").map(a => a.trim()).filter(Boolean) })}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About the event */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">About the event</h3>
            <Alert className="mb-4">
              <AlertDescription>
                Describe your event. A good explanation will set the expectations right to your potential audience
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="description" className="mb-2">Event description</Label>
              <div className="border rounded-lg">
                <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
                  <Button variant="ghost" size="sm" className="font-bold">B</Button>
                  <Button variant="ghost" size="sm" className="italic">I</Button>
                  <Button variant="ghost" size="sm" className="underline">U</Button>
                </div>
                <textarea
                  id="description"
                  placeholder="Enter a brief description of the show"
                  className="w-full p-3 min-h-[120px] resize-none focus:outline-none"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Images */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add Images</h3>
            <Alert className="mb-4">
              <AlertDescription>
                Changes to event name or banner image will be sent for review again. If you wish for no review and instant re-start of sales you should use same name & banner image.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {/* Horizontal Banner */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Horizontal Banner</h4>
                  <Button variant="outline" size="sm">GUIDE</Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Minimum 1280 x 640, aspect ratio 2:1, max 1MB
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                     onClick={() => document.getElementById('horizontal-banner')?.click()}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Header Image</p>
                  </div>
                  <input
                    id="horizontal-banner"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        console.log('Horizontal banner uploaded:', file.name)
                      }
                    }}
                  />
                </div>
              </div>

              {/* Vertical Poster */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Vertical Poster</h4>
                  <Button variant="outline" size="sm">GUIDE</Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Minimum 500 x 750, aspect ratio 1:1.5, max 1MB
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                     onClick={() => document.getElementById('vertical-poster')?.click()}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Vertical Poster</p>
                  </div>
                  <input
                    id="vertical-poster"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        console.log('Vertical poster uploaded:', file.name)
                      }
                    }}
                  />
                </div>
              </div>
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
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create New Event</h2>
        <p className="text-muted-foreground">Let's start with the basic details</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="eventName" className="mb-2">What is the name of your event?</Label>
          <Input
            id="eventName"
            placeholder="Event Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={errors.name ? "border-destructive" : "focus:ring-2 focus:ring-primary/20 border-input"}
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label>What is your event's category?</Label>
          <p className="text-sm text-muted-foreground mb-2">Only 1 category can be selected</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => {
                  setSelectedCategory(category)
                  setSelectedSubCategory("")
                  setErrors({ ...errors, category: "" })
                }}
              >
                {category}
                {selectedCategory === category && <X className="ml-2 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
        </div>

        <div>
          <Label htmlFor="subCategory" className="mb-2">What is your event's sub category?</Label>
          <div className="relative">
            <Input
              id="subCategory"
              placeholder={selectedSubCategory || "Select a sub category"}
              value={selectedSubCategory}
              readOnly
              className={errors.subCategory ? "border-destructive pr-12" : "pr-12"}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {selectedCategory && (
            <div className="flex flex-wrap gap-2 mt-3">
              {subCategories[selectedCategory as keyof typeof subCategories]?.map((sub) => (
                <Badge
                  key={sub}
                  variant={selectedSubCategory === sub ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    setSelectedSubCategory(sub)
                    setErrors({ ...errors, subCategory: "" })
                  }}
                >
                  {sub}
                </Badge>
              ))}
            </div>
          )}
          {errors.subCategory && <p className="text-sm text-destructive mt-1">{errors.subCategory}</p>}
        </div>

        <div>
          <Label htmlFor="genre" className="mb-2">Select event genre *</Label>
          <div className="relative">
            <Input
              id="genre"
              placeholder={selectedGenre || "Select genre"}
              value={selectedGenre}
              readOnly
              className={errors.genre ? "border-destructive pr-12" : "pr-12"}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {genres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => {
                  setSelectedGenre(genre)
                  setErrors({ ...errors, genre: "" })
                }}
              >
                {genre}
              </Badge>
            ))}
          </div>
          {errors.genre && <p className="text-sm text-destructive mt-1">{errors.genre}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Create Event</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push("/vendor")}>
              Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            
            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {step === 1 ? "Proceed" : "Create Event"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
