"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Music, Trophy, Drama, Laugh, PartyPopper, Presentation, X } from "lucide-react"

const categories = [
  { name: "All Events", slug: "", icon: null },
  { name: "Concerts", slug: "concerts", icon: Music },
  { name: "Sports", slug: "sports", icon: Trophy },
  { name: "Theater", slug: "theater", icon: Drama },
  { name: "Comedy", slug: "comedy", icon: Laugh },
  { name: "Festivals", slug: "festivals", icon: PartyPopper },
  { name: "Conferences", slug: "conferences", icon: Presentation },
]

const sortOptions = [
  { label: "Recommended", value: "" },
  { label: "Date: Soonest", value: "date-asc" },
  { label: "Date: Latest", value: "date-desc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Trending", value: "trending" },
]

const dateFilters = [
  { label: "All Dates", value: "" },
  { label: "Today", value: "today" },
  { label: "This Weekend", value: "weekend" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
]

interface EventsFiltersProps {
  selectedCategory?: string
  selectedSort?: string
  selectedDate?: string
}

export function EventsFilters({ selectedCategory, selectedSort, selectedDate }: EventsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/events?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push("/events")
  }

  const hasFilters = selectedCategory || selectedSort || selectedDate

  return (
    <div className="space-y-6">
      {/* Clear filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full justify-start gap-2">
          <X className="h-4 w-4" />
          Clear all filters
        </Button>
      )}

      {/* Categories */}
      <div>
        <h3 className="mb-3 font-semibold">Category</h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = (selectedCategory || "") === category.slug
            return (
              <button
                key={category.slug}
                onClick={() => updateFilter("category", category.slug)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Date */}
      <div>
        <h3 className="mb-3 font-semibold">Date</h3>
        <RadioGroup value={selectedDate || ""} onValueChange={(value) => updateFilter("date", value)}>
          {dateFilters.map((filter) => (
            <div key={filter.value} className="flex items-center space-x-2">
              <RadioGroupItem value={filter.value} id={`date-${filter.value || "all"}`} />
              <Label htmlFor={`date-${filter.value || "all"}`} className="cursor-pointer text-sm">
                {filter.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-3 font-semibold">Sort By</h3>
        <RadioGroup value={selectedSort || ""} onValueChange={(value) => updateFilter("sort", value)}>
          {sortOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`sort-${option.value || "default"}`} />
              <Label htmlFor={`sort-${option.value || "default"}`} className="cursor-pointer text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
