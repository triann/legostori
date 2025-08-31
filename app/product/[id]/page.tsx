"use client"

import { useEffect } from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetails } from "@/components/product-details"
import { products } from "@/lib/products"
import { unifiedTracking } from "@/lib/unified-tracking"

export { products } from "@/lib/products"

export default function ProductPage({ params, searchParams }) {
  const product = products[params.id]

  // Extract discount from URL parameters
  const discount = searchParams?.discount ? Number(searchParams.discount) : 0

  console.log("[v0] ProductPage - Discount from URL:", discount)
  console.log("[v0] ProductPage - SearchParams:", searchParams)

  useEffect(() => {
    unifiedTracking.trackPageView()
  }, [])

  if (!product) {
    notFound()
  }

  return (
    <>
      <Header />
      <ProductDetails product={product} discount={discount} />
      <Footer />
    </>
  )
}
