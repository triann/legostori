"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { CommunitySection } from "@/components/community-section"
import { Footer } from "@/components/footer"
import { UTMCapture } from "@/components/utm-capture"

export default function ProductsPage() {
  const [discount, setDiscount] = useState(0)
  const searchParams = useSearchParams()

  useEffect(() => {
    const discountParam = searchParams.get("discount")
    if (discountParam) {
      setDiscount(Number.parseInt(discountParam))
    }
  }, [searchParams])

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
