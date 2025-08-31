"use client"
import { ProductGrid } from "@/components/product-grid"
import { UTMCapture } from "@/components/utm-capture"
import { unifiedTracking } from "@/lib/unified-tracking"
import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    unifiedTracking.trackPageView()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <UTMCapture />

      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">LEGO Store - Construa Seus Sonhos</h1>
          <p className="text-lg md:text-xl opacity-90">Descubra os melhores sets LEGO com descontos especiais</p>
        </div>
      </div>

      <ProductGrid />
      {/* </CHANGE> */}
    </div>
  )
}
