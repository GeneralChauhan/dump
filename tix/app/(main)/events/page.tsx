import { Suspense } from "react"
import { EventsGrid } from "@/components/events/events-grid"
import { EventsFilters } from "@/components/events/events-filters"
import { EventsSearch } from "@/components/events/events-search"

export const metadata = {
  title: "Browse Events | TicketFlow",
  description: "Discover and book tickets to concerts, sports, theater, and more live events near you.",
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; date?: string }>
}) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Discover Events</h1>
        <p className="mt-2 text-muted-foreground">Find your next unforgettable experience</p>
      </div>

      {/* Search */}
      <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-card" />}>
        <EventsSearch />
      </Suspense>

      {/* Filters and Grid */}
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 lg:w-64">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-card" />}>
            <EventsFilters selectedCategory={params.category} selectedSort={params.sort} selectedDate={params.date} />
          </Suspense>
        </aside>

        {/* Events grid */}
        <div className="flex-1">
          <Suspense fallback={<EventsGridSkeleton />}>
            <EventsGrid category={params.category} search={params.q} sort={params.sort} date={params.date} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function EventsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border/50 bg-card p-2">
          <div className="aspect-[4/3] rounded-xl bg-muted" />
          <div className="p-4">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
