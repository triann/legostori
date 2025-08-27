"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { CommunitySection } from "@/components/community-section"
import { Footer } from "@/components/footer"
import { UTMCapture } from "@/components/utm-capture"
import { useAnalytics } from "@/hooks/use-analytics"

function ProductsContent() {
  const [discount, setDiscount] = useState(0)
  const searchParams = useSearchParams()
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent("products_page_view", {
      page: "products",
      timestamp: Date.now(),
    })

    const discountParam = searchParams.get("discount")
    if (discountParam) {
      setDiscount(Number.parseInt(discountParam))
      trackEvent("discount_applied", {
        discount: Number.parseInt(discountParam),
        page: "products",
      })
    }
  }, [searchParams, trackEvent])

  return (
    <div className="min-h-screen bg-white">
      <UTMCapture />
      <Header />
      <Hero discount={discount} />
      <ProductGrid discount={discount} />
      <CommunitySection />
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProductsContent />
    </Suspense>
  )
}
