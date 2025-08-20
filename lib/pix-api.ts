const API_CONFIG = {
  API_BASE_URL: "https://monkeycheckout.online/vakinha-luky",
  FRONTEND_URL: "https://legostore.online", // Adicionado baseado no config funcional
}

export interface PixPaymentData {
  amount: number
  email: string
  name?: string
  phone?: string
  cpf?: string
  description?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  xcod?: string
  sck?: string
  utm_id?: string
}

export interface PixResponse {
  success: boolean
  qrcode?: string
  pixCopiaECola?: string
  pixCode?: string
  token?: string
  message?: string
  error?: string
}

export interface PaymentStatus {
  success: boolean
  status: "PENDING" | "APPROVED" | "REJECTED"
  error?: string
}

export function getUtmParams() {
  if (typeof window === "undefined") return {}

  const urlParams = new URLSearchParams(window.location.search)
  return {
    utm_source: urlParams.get("utm_source"),
    utm_medium: urlParams.get("utm_medium"),
    utm_campaign: urlParams.get("utm_campaign"),
    utm_content: urlParams.get("utm_content"),
    utm_term: urlParams.get("utm_term"),
    xcod: urlParams.get("xcod"),
    sck: urlParams.get("sck"),
    utm_id: urlParams.get("utm_id"),
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, timeout = 15000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[v0] Tentativa ${i + 1}/${retries} para ${url}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      console.error(`[v0] Erro na tentativa ${i + 1}:`, error)

      if (i === retries - 1) {
        throw error
      }

      // Aguardar antes da próxima tentativa
      const delay = 1000 * (i + 1)
      console.log(`[v0] Aguardando ${delay}ms antes da próxima tentativa...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("Todas as tentativas falharam")
}

export async function createPixPayment(data: PixPaymentData): Promise<PixResponse> {
  try {
    console.log("🚀 Iniciando processo de pagamento PIX...")

    if (!data.email || !data.amount || data.amount <= 0) {
      return {
        success: false,
        error: "Dados inválidos: email e valor são obrigatórios",
      }
    }

    // Capturar parâmetros UTM
    const utmParams = getUtmParams()

    // Preparar dados conforme o HTML funcional
    const paymentData = {
      ...utmParams,
      nome: data.name || "",
      email: data.email,
      cpf: data.cpf?.replace(/\D/g, "") || "",
      telefone: data.phone?.replace(/\D/g, "") || "",
    }

    console.log("📤 Enviando dados para API:", {
      valor: data.amount,
      dados: paymentData,
    })

    const response = await fetchWithRetry(`${API_CONFIG.API_BASE_URL}/pagamento.php?valor=${data.amount}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()
    console.log("📥 Resposta da API:", result)

    if (result.success) {
      return {
        success: true,
        qrcode: result.pixCopiaECola || result.pixCode || result.qrcode,
        pixCopiaECola: result.pixCopiaECola,
        pixCode: result.pixCode,
        token: result.token,
      }
    } else {
      return {
        success: false,
        error: result.message || result.error || "Erro ao criar pagamento PIX",
      }
    }
  } catch (error) {
    console.error("❌ Erro na API PIX:", error)

    let errorMessage = "Erro de conexão com a API"
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Timeout na conexão - tente novamente"
      } else if (error.message.includes("HTTP")) {
        errorMessage = `Erro do servidor: ${error.message}`
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Problema de conectividade - verifique sua internet"
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
  try {
    console.log("[v0] Verificando status para transação:", transactionId)

    if (!transactionId || transactionId.trim() === "") {
      return {
        success: false,
        status: "PENDING",
        error: "Token de transação inválido",
      }
    }

    const response = await fetchWithRetry(
      `${API_CONFIG.API_BASE_URL}/verificar.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          idtransaction: transactionId,
        }),
      },
      2,
      15000,
    ) // Menos tentativas e timeout menor para verificação

    const result = await response.json()
    console.log("[v0] Resposta da verificação:", result)

    return {
      success: result.success,
      status: result.status,
      error: result.error,
    }
  } catch (error) {
    console.error("[v0] Erro ao verificar status:", error)

    return {
      success: false,
      status: "PENDING",
      error: "Erro temporário na verificação",
    }
  }
}

export function generateQRCodeUrl(pixCode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}&ecc=M&color=000000&bgcolor=FFFFFF&qzone=2&format=png`
}

export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1")
}

export function maskMoney(value: string): string {
  let v = value.replace(/\D/g, "")
  v = (Number.parseInt(v) / 100).toFixed(2) + ""
  v = v.replace(".", ",")
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")
  return v
}

export function validateEmail(email: string): boolean {
  return email.includes("@") && email.includes(".")
}
