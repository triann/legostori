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

function createLogFile(logData: any) {
  if (typeof window !== "undefined") {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      ...logData,
    }

    // Salvar no localStorage para persistência
    const existingLogs = localStorage.getItem("assetpay_debug_logs") || "[]"
    const logs = JSON.parse(existingLogs)
    logs.push(logEntry)

    // Manter apenas os últimos 50 logs
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50)
    }

    localStorage.setItem("assetpay_debug_logs", JSON.stringify(logs, null, 2))

    // Criar arquivo para download
    const logContent = JSON.stringify(logs, null, 2)
    const blob = new Blob([logContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    console.log(`[v0] Log salvo - Download disponível em:`, url)
    console.log(`[v0] Para baixar logs, execute no console: 
      const downloadLink = document.createElement('a');
      downloadLink.href = '${url}';
      downloadLink.download = 'assetpay_debug_${timestamp.replace(/[:.]/g, "-")}.json';
      downloadLink.click();
    `)
  }
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
    console.log("[v0] 🚀 Iniciando processo de pagamento por cartão...")

    const debugInfo = {
      windowExists: typeof window !== "undefined",
      assetPayExists: typeof window !== "undefined" && !!(window as any).AssetPay,
      fingerprintJSExists: typeof window !== "undefined" && !!(window as any).FingerprintJS,
      amount: data.amount,
    }

    console.log("[v0] 🔍 Verificando bibliotecas:", debugInfo)
    createLogFile({ type: "library_check", data: debugInfo })

    if (typeof window === "undefined" || !(window as any).AssetPay) {
      throw new Error("Biblioteca AssetPay não carregada")
    }

    const cardInfo = (data as any).cardData || data.card
    if (!cardInfo) {
      throw new Error("Dados do cartão não encontrados")
    }

    console.log("[v0] 📇 Dados do cartão coletados")
    console.log(cardInfo)

    const publicKey = "pk_live_v2D5sJPOcIhr7OFQn6aMUzb80GDHT3BXHz"
    console.log("[v0] 🔑 Configurando AssetPay...")
    ;(window as any).AssetPay.setPublicKey(publicKey)
    ;(window as any).AssetPay.setTestMode(false)

    const expMonth = Number.parseInt(cardInfo.expirationMonth || cardInfo.exp_month, 10)
    const expYear = Number.parseInt(cardInfo.expirationYear || cardInfo.exp_year, 10)

    const cardData = {
      number: cardInfo.number.replace(/\s/g, ""),
      holderName: cardInfo.holderName || cardInfo.holder_name,
      expMonth,
      expYear,
      cvv: cardInfo.cvv,
    }

    let deviceFingerprint = ""
    try {
      if (typeof window !== "undefined" && (window as any).FingerprintJS) {
        const fpPromise = (window as any).FingerprintJS.load()
        const fp = await fpPromise
        const visitorData = await fp.get()
        deviceFingerprint = visitorData.visitorId
        console.log("[v0] 🆔 Device fingerprint (FingerprintJS) gerado:", deviceFingerprint)
      } else {
        console.log("[v0] ⚠️ FingerprintJS não disponível, gerando fingerprint alternativo...")

        // Gerar fingerprint alternativo mais robusto
        const browserInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack,
          hardwareConcurrency: navigator.hardwareConcurrency,
          maxTouchPoints: navigator.maxTouchPoints,
          screenWidth: screen.width,
          screenHeight: screen.height,
          screenColorDepth: screen.colorDepth,
          timezoneOffset: new Date().getTimezoneOffset(),
          timestamp: Date.now(),
        }

        const fingerprint = btoa(JSON.stringify(browserInfo))
        deviceFingerprint = fingerprint
        console.log("[v0] 🆔 Fingerprint alternativo gerado:", fingerprint.substring(0, 50) + "...")
      }
    } catch (error) {
      console.log("[v0] ⚠️ Erro ao gerar fingerprint, usando fallback simples:", error)
      deviceFingerprint = btoa(`${navigator.userAgent}-${Date.now()}-${Math.random()}`)
    }

    console.log("[v0] 🔑 Token do cartão gerado")
    const cardToken = await (window as any).AssetPay.encrypt(cardData)

    if (!cardToken) {
      throw new Error("Token do cartão não foi gerado corretamente")
    }

    console.log(cardToken)

    console.log("[v0] 🔍 Verificando conectividade com a API...")

    // Capturar parâmetros UTM
    const utmParams = getUtmParams()

    const payload = {
      amount: data.amount,
      cardToken,
      deviceFingerprint,
      name: data.name,
      email: data.email,
      cpf: data.cpf.replace(/\D/g, ""),
      phone: data.phone.replace(/\D/g, ""),
      description: data.description,
      installments: (data as any).installments || 1,
      ...utmParams,
    }

    console.log("[v0] 📤 Payload enviado para backend")
    console.log(payload)

    createLogFile({
      type: "payment_request",
      payload: {
        ...payload,
        cardToken: cardToken.substring(0, 50) + "...",
        deviceFingerprint: deviceFingerprint.substring(0, 50) + "...",
      },
    })

    console.log("[v0] 🌐 Enviando requisição HTTP")
    console.log({
      url: `${API_CONFIG.API_BASE_URL}/pagamento-cartao.php`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // Aumentado para 30s

    try {
      console.log("[v0] ⏳ Iniciando requisição fetch...")
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/pagamento-cartao.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`[v0] 📄 Resposta HTTP recebida - Status: ${response.status}`)

      if (!response.ok) {
        console.log(`[v0] ❌ Erro HTTP ${response.status}`)
        const errorText = await response.text()
        console.log(errorText)
        createLogFile({
          type: "payment_error",
          error: `HTTP ${response.status}`,
          response: errorText,
          status: response.status,
        })
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] 📥 Resposta da API:", result)
      createLogFile({ type: "payment_response", response: result, status: response.status })

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
      clearTimeout(timeoutId)
      console.log("[v0] ❌ Erro na requisição HTTP")
      createLogFile({ type: "payment_error", error: error.toString() })

      if (error.name === "AbortError") {
        throw new Error("Timeout: A requisição demorou mais de 30 segundos")
      }
      throw error
    }
  } catch (error) {
    console.error("[v0] ❌ Erro na API de cartão:", error)
    createLogFile({ type: "payment_error", error: error.toString() })
    return {
      success: false,
      error: error.message || "Erro de conexão com a API de pagamento",
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
