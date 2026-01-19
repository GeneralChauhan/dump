import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live events happening now
          </div>

          {/* Heading */}
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Gateway to{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Unforgettable
            </span>{" "}
            Live Experiences
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
            Discover concerts, sports, theater, and more. Book tickets instantly with secure QR codes and never miss a
            moment.
          </p>

          {/* Search bar */}
          <div className="mt-10">
            <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search events, artists, or venues..."
                  className="h-12 border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="relative flex-1 sm:border-l sm:border-border sm:pl-3">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground sm:left-6" />
                <Input
                  type="text"
                  placeholder="City or venue"
                  className="h-12 border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0 sm:pl-12"
                />
              </div>
              <Link href="/events">
                <Button size="lg" className="h-12 gap-2 px-6">
                  <Search className="h-4 w-4" />
                  Find Events
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {["Concerts", "NBA", "Comedy Shows", "Broadway"].map((item) => (
              <Link
                key={item}
                href={`/events?q=${item.toLowerCase()}`}
                className="rounded-full border border-border/50 px-4 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Events", value: "10K+" },
            { label: "Venues", value: "500+" },
            { label: "Happy Customers", value: "1M+" },
            { label: "Cities", value: "100+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/50 bg-card/30 p-4 text-center backdrop-blur"
            >
              <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
