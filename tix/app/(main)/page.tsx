import { HeroSection } from "@/components/home/hero-section"
import { FeaturedEvents } from "@/components/home/featured-events"
import { CategoryGrid } from "@/components/home/category-grid"
import { TrendingEvents } from "@/components/home/trending-events"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedEvents />
      <CategoryGrid />
      <TrendingEvents />
      <CTASection />
    </>
  )
}
