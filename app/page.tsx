import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { CommunitySection } from "@/components/community-section"
import { Footer } from "@/components/footer"
import { UTMCapture } from "@/components/utm-capture"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <UTMCapture />
      <Header />
      <Hero />
      <ProductGrid />
      <CommunitySection />
      <Footer />
    </div>
  )
}
