import Link from "next/link"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Music, Trophy, Drama, Laugh, PartyPopper, Presentation } from "lucide-react"

const categories = [
  {
    name: "Concerts",
    slug: "concerts",
    icon: Music,
    description: "Live music from your favorite artists",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    count: "2,450+",
  },
  {
    name: "Sports",
    slug: "sports",
    icon: Trophy,
    description: "NFL, NBA, MLB, and more",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    count: "1,890+",
  },
  {
    name: "Theater",
    slug: "theater",
    icon: Drama,
    description: "Broadway shows and plays",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    count: "890+",
  },
  {
    name: "Comedy",
    slug: "comedy",
    icon: Laugh,
    description: "Stand-up and improv shows",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    count: "650+",
  },
  {
    name: "Festivals",
    slug: "festivals",
    icon: PartyPopper,
    description: "Multi-day music festivals",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    count: "320+",
  },
  {
    name: "Conferences",
    slug: "conferences",
    icon: Presentation,
    description: "Tech talks and summits",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    count: "180+",
  },
]

export function CategoryGrid() {
  return (
    <section className="border-y border-border/50 bg-card/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse by Category</h2>
          <p className="mt-2 text-muted-foreground">Find events that match your interests</p>
        </div>

        {/* Categories grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.slug} href={`/events?category=${category.slug}`} className="group">
                <div className="relative h-full rounded-2xl border border-border/50 p-2 transition-all hover:border-primary/50">
                  <GlowingEffect
                    spread={30}
                    glow={true}
                    disabled={false}
                    proximity={48}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <div className="relative flex h-full items-center gap-4 rounded-xl bg-card p-5">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${category.bgColor}`}
                    >
                      <Icon className={`h-7 w-7 ${category.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold group-hover:text-primary">{category.name}</h3>
                        <span className="text-sm text-muted-foreground">{category.count}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
