"use client"

import { CheckoutHeader } from "@/components/checkout-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { checkPaymentStatus, generateQRCodeUrl } from "@/lib/pix-api"

interface PixPaymentData {
  qrcode: string
  token: string
  amount: number
  productName: string
  email: string
  name: string
}

export default function PixPage() {
  const [pixData, setPixData] = useState<PixPaymentData | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Carregar dados do PIX do localStorage
    const savedPixData = localStorage.getItem("pixPayment")
    if (savedPixData) {
      setPixData(JSON.parse(savedPixData))
    }
  }, [])

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    // Remove toast anterior se existir
    const existingToast = document.querySelector(".toast")
    if (existingToast) {
      existingToast.remove()
    }

    // Cria novo toast
    const toast = document.createElement("div")
    toast.className = `toast ${type}`
    toast.textContent = message

    // Adicionar estilos do toast
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: ${type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#3b82f6"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 2000;
      opacity: 0;
      transition: all 0.3s ease;
      min-width: 280px;
      max-width: 85%;
      text-align: center;
      font-weight: 400;
      font-size: 14px;
      line-height: 1.4;
    `

    document.body.appendChild(toast)

    // Mostra o toast
    setTimeout(() => {
      toast.style.opacity = "1"
      toast.style.transform = "translateX(-50%) translateY(0)"
    }, 100)

    // Remove o toast após 4 segundos
    setTimeout(() => {
      toast.style.opacity = "0"
      toast.style.transform = "translateX(-50%) translateY(100px)"
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 4000)
  }

  const confirmPayment = () => {
    if (confirm("Você confirma que já efetuou o pagamento?")) {
      checkPaymentStatusNow()
      showToast("Obrigado! Estamos verificando seu pagamento.", "info")
    }
  }

  const checkPaymentStatusNow = async () => {
    if (!pixData?.token) return

    try {
      const status = await checkPaymentStatus(pixData.token)
      if (status.success && status.status === "APPROVED") {
        setPaymentStatus("approved")
        showToast("Pagamento confirmado! Obrigado pela sua contribuição.", "success")

        // Redirecionar após 3 segundos
        setTimeout(() => {
          window.location.href = "/"
        }, 3000)
      } else if (status.status === "REJECTED") {
        setPaymentStatus("rejected")
        showToast("Pagamento rejeitado. Tente novamente.", "error")
      } else {
        showToast("Pagamento ainda está sendo processado.", "warning")
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      showToast("Erro ao verificar status do pagamento.", "error")
    }
  }

  useEffect(() => {
    if (!pixData?.token) return

    const interval = setInterval(async () => {
      try {
        console.log("Verificando status para transação:", pixData.token)
        const status = await checkPaymentStatus(pixData.token)

        if (status.success && status.status === "APPROVED") {
          setPaymentStatus("approved")
          clearInterval(interval)
          showToast("Pagamento confirmado! Redirecionando...", "success")

          // Redirecionar após 3 segundos
          setTimeout(() => {
            window.location.href = "/"
          }, 3000)
        } else if (status.status === "REJECTED") {
          setPaymentStatus("rejected")
          clearInterval(interval)
        } else {
          console.log("Pagamento ainda pendente")
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error)
      }
    }, 10000) // Verificar a cada 10 segundos

    // Parar verificação após 15 minutos
    setTimeout(() => {
      clearInterval(interval)
      console.log("Verificação automática interrompida após 15 minutos")
    }, 900000)

    return () => clearInterval(interval)
  }, [pixData])

  const copyPixCode = () => {
    if (pixData?.qrcode) {
      navigator.clipboard.writeText(pixData.qrcode)
      setCopied(true)
      showToast("Código PIX copiado!", "success")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!pixData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Carregando dados do pagamento...</p>
          <Link href="/checkout" className="text-orange-500 hover:underline">
            Voltar ao checkout
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />

      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">Pagamento PIX</h1>
          <Link href="/checkout" className="text-sm text-orange-500 hover:underline">
            Voltar para o checkout
          </Link>
        </div>

        <div className="p-6">
          {/* Status do Pagamento */}
          {paymentStatus === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-800 font-medium text-sm">Aguardando pagamento...</span>
              </div>
              <p className="text-yellow-700 text-xs mt-2">O pagamento será verificado automaticamente.</p>
            </div>
          )}

          {paymentStatus === "approved" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-800 font-medium text-sm">Pagamento confirmado!</span>
              </div>
              <p className="text-green-700 text-xs mt-2">Redirecionando para a página inicial...</p>
            </div>
          )}

          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg width="48" height="24" viewBox="0 0 120 60" fill="none">
                <rect width="120" height="60" rx="8" fill="white" />
                <path d="M20 20h15l8 8-8 8H20l8-8-8-8z" fill="#32BCAD" />
                <path d="M85 20h15l-8 8 8 8H85l-8-8 8-8z" fill="#32BCAD" />
                <text x="60" y="35" textAnchor="middle" fill="#32BCAD" fontSize="12" fontWeight="bold">
                  PIX
                </text>
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">Escaneie o código QR para pagar</h2>
            <p className="text-sm text-gray-600 mb-6">Use o app do seu banco ou carteira digital</p>

            {/* QR Code Real */}
            <div className="w-48 h-48 mx-auto mb-6 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <img
                src={generateQRCodeUrl(pixData.qrcode) || "/placeholder.svg"}
                alt="QR Code PIX"
                className="w-44 h-44 rounded"
              />
            </div>

            {/* Informações do Pagamento */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Produto:</strong> {pixData.productName}
                </div>
                <div>
                  <strong>Valor:</strong> R$ {pixData.amount.toFixed(2)}
                </div>
                <div>
                  <strong>Cliente:</strong> {pixData.name}
                </div>
                <div>
                  <strong>E-mail:</strong> {pixData.email}
                </div>
              </div>
            </div>

            <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Como pagar:</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Abra o app do seu banco</li>
                <li>2. Escolha a opção PIX</li>
                <li>3. Escaneie o código QR</li>
                <li>4. Confirme o pagamento</li>
              </ol>
            </div>

            <div className="text-center mb-4">
              <button
                onClick={confirmPayment}
                className="text-green-500 font-medium text-sm underline hover:text-green-600"
              >
                Tudo certo, já paguei!
              </button>
            </div>

            <Button
              onClick={copyPixCode}
              className={`w-full py-3 rounded-full font-semibold mb-4 ${
                copied ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {copied ? "Código copiado!" : "Copiar código PIX"}
            </Button>

            <p className="text-xs text-gray-500">O pagamento será processado automaticamente após a confirmação</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
