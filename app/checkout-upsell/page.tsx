"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPixPayment } from "@/lib/pix-api"
import { Shield, Loader2 } from "lucide-react"

interface UpsellProduct {
  id: string
  name: string
  price: number
  image: string
  description: string
  isDigital: boolean
}

interface CustomerData {
  name: string
  email: string
  document: string
}

export default function CheckoutUpsell() {
  const router = useRouter()
  const [product, setProduct] = useState<UpsellProduct | null>(null)
  const [customerData, setCustomerData] = useState<CustomerData>({ name: "", email: "", document: "" })
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<"review" | "email" | "processing">("review")

  useEffect(() => {
    const upsellProduct = localStorage.getItem("checkoutProduct")
    const originalCustomer = localStorage.getItem("pixPayment")

    if (upsellProduct) {
      const productData = JSON.parse(upsellProduct)
      setProduct(productData)
    }

    if (originalCustomer) {
      const customer = JSON.parse(originalCustomer)
      setCustomerData({
        name: customer.name || "",
        email: customer.email || "",
        document: customer.document || customer.cpf || "",
      })
      setEmail(customer.email || "")
    }

    // Se não há produto, redirecionar
    if (!upsellProduct) {
      router.push("/")
    }
  }, [router])

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100)
  }

  const handleContinueToEmail = () => {
    setCurrentStep("email")
  }

  const handleProcessPayment = async () => {
    if (!email || !product) return

    setIsProcessing(true)
    setCurrentStep("processing")

    try {
      const pixData = {
        amount: product.price,
        productName: product.name,
        productId: product.id,
        name: customerData.name,
        email: email,
        document: customerData.document,
        isUpsell: true,
        originalProduct: localStorage.getItem("originalProduct") || "",
      }

      localStorage.setItem("pixPayment", JSON.stringify(pixData))

      const result = await createPixPayment(pixData)

      if (result.success) {
        router.push("/pix")
      } else {
        throw new Error(result.error || "Erro ao processar pagamento")
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      setIsProcessing(false)
      setCurrentStep("email")
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
          <p className="text-gray-600">Produto digital - sem necessidade de entrega</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Produto Digital</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-red-600">{formatPrice(product.price)}</div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-red-600">{formatPrice(product.price)}</span>
            </div>
          </div>
        </div>

        {currentStep === "review" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Confirmar Pedido</h2>
            <p className="text-gray-600 mb-6">
              Você está adquirindo um produto digital. Após a confirmação do pagamento, você receberá as instruções por
              e-mail.
            </p>

            <button
              onClick={handleContinueToEmail}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Continuar para Pagamento
            </button>
          </div>
        )}

        {currentStep === "email" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Confirmar E-mail</h2>
            <p className="text-gray-600 mb-4">Confirme seu e-mail para receber as instruções do produto digital:</p>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="seu@email.com"
                required
              />
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={!email || isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Gerar PIX
                </>
              )}
            </button>
          </div>
        )}

        {currentStep === "processing" && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Processando Pagamento</h2>
            <p className="text-gray-600">Aguarde enquanto geramos seu PIX...</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
