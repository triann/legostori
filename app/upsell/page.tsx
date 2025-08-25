import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import UpsellFlow from "@/components/upsell-flow"

export default function UpsellPage() {
  return (
    <div className="min-h-screen bg-white">
    <Suspense fallback={<div className="h-16 bg-yellow-400"></div>}>
      <Header />
    </Suspense>
      <div className="bg-gray-50 py-8">
        <UpsellFlow />
      </div>
      <Footer />
    </div>
  )
}
