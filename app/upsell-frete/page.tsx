import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import UpsellFreteFlow from "@/components/upsell-frete-flow"

export default function UpsellFretePage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="h-16 bg-yellow-400"></div>}>
        <Header/>
      </Suspense>
      <main className="py-8">
        <UpsellFreteFlow />
      </main>
      <Footer />
    </div>
  )
}
