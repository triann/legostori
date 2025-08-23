import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import UpsellFreteFlow from "@/components/upsell-frete-flow"

export default function UpsellFretePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-8">
        <UpsellFreteFlow />
      </main>
      <Footer />
    </div>
  )
}
