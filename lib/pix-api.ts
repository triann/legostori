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

export async function createPixPayment(data: PixPaymentData): Promise<PixResponse> {
  try {
    console.log("🚀 Iniciando processo de pagamento PIX...")
    console.log("📥 Dados recebidos na função:", data)

    // Capturar parâmetros UTM
    const utmParams = getUtmParams()
    console.log("🔗 Parâmetros UTM capturados:", utmParams)

    const paymentData = {
      // Campos obrigatórios conforme o PHP
      nome: data.name || "",
      email: data.email,
      cpf: data.cpf?.replace(/\D/g, "") || "",
      telefone: data.phone?.replace(/\D/g, "") || "",
      // Incluir todos os parâmetros UTM no body
      ...utmParams,
    }

    console.log("📤 Dados estruturados para envio:", paymentData)
    console.log("📤 Enviando dados para API:", {
      valor: data.amount,
      dados: paymentData,
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

    const apiUrl = `${API_CONFIG.API_BASE_URL}/pagamento.php?valor=${data.amount}`
    console.log("🌐 URL da API:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "LegoStore/1.0",
        Origin: API_CONFIG.FRONTEND_URL,
        Referer: API_CONFIG.FRONTEND_URL,
      },
      body: JSON.stringify(paymentData),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("📡 Status da resposta:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erro HTTP:", response.status, errorText)

      if (response.status === 400) {
        throw new Error("Dados inválidos enviados para a API. Verifique os campos obrigatórios.")
      } else if (response.status === 403) {
        throw new Error("Acesso negado pela API. Verifique as credenciais.")
      } else if (response.status === 404) {
        throw new Error("Endpoint da API não encontrado.")
      } else {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`)
      }
    }

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

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Timeout na conexão com a API. Tente novamente.",
        }
      } else {
        return {
          success: false,
          error: error.message,
        }
      }
    }

    return {
      success: false,
      error: "Erro de conexão com a API",
    }
  }
}

export async function checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
  try {
    console.log("Verificando status para transação:", transactionId)

    const response = await fetch(`${API_CONFIG.API_BASE_URL}/verificar.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idtransaction: transactionId,
      }),
    })

    const result = await response.json()
    console.log("Resposta da verificação:", result)

    return {
      success: result.success,
      status: result.status,
      error: result.error,
    }
  } catch (error) {
    console.error("Erro ao verificar status:", error)
    return {
      success: false,
      status: "PENDING",
      error: "Erro de conexão",
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
