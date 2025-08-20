export interface UTMParams {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  xcod?: string | null
  sck?: string | null
  utm_id?: string | null
  fbclid?: string | null
  gclid?: string | null
  ttclid?: string | null
}

const UTM_STORAGE_KEY = "lego_utm_params"
const UTM_EXPIRY_KEY = "lego_utm_expiry"
const UTM_EXPIRY_HOURS = 24 // UTMs expiram em 24 horas

export class UTMManager {
  private static instance: UTMManager
  private utmParams: UTMParams = {}

  private constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
      this.captureFromURL()
    }
  }

  public static getInstance(): UTMManager {
    if (!UTMManager.instance) {
      UTMManager.instance = new UTMManager()
    }
    return UTMManager.instance
  }

  private captureFromURL(): void {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const newParams: UTMParams = {}
    let hasNewParams = false

    // Lista de todos os parâmetros UTM que queremos capturar
    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "xcod",
      "sck",
      "utm_id",
      "fbclid",
      "gclid",
      "ttclid",
    ]

    utmKeys.forEach((key) => {
      const value = urlParams.get(key)
      if (value) {
        newParams[key as keyof UTMParams] = value
        hasNewParams = true
      }
    })

    if (hasNewParams) {
      console.log("[UTM Manager] 📥 Novos parâmetros UTM capturados da URL:", newParams)

      // Merge com parâmetros existentes (novos têm prioridade)
      this.utmParams = { ...this.utmParams, ...newParams }
      this.saveToStorage()

      // Limpar URL dos parâmetros UTM para melhor UX
      this.cleanURL(utmKeys)
    }
  }

  private cleanURL(utmKeys: string[]): void {
    if (typeof window === "undefined") return

    const url = new URL(window.location.href)
    let hasChanges = false

    utmKeys.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key)
        hasChanges = true
      }
    })

    if (hasChanges) {
      window.history.replaceState({}, "", url.toString())
      console.log("[UTM Manager] 🧹 URL limpa dos parâmetros UTM")
    }
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(UTM_STORAGE_KEY)
      const expiry = localStorage.getItem(UTM_EXPIRY_KEY)

      if (stored && expiry) {
        const expiryTime = Number.parseInt(expiry)
        const now = Date.now()

        if (now < expiryTime) {
          this.utmParams = JSON.parse(stored)
          console.log("[UTM Manager] 📂 UTMs carregados do localStorage:", this.utmParams)
        } else {
          console.log("[UTM Manager] ⏰ UTMs expirados, removendo do storage")
          this.clearStorage()
        }
      }
    } catch (error) {
      console.error("[UTM Manager] ❌ Erro ao carregar UTMs do storage:", error)
      this.clearStorage()
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return

    try {
      const expiry = Date.now() + UTM_EXPIRY_HOURS * 60 * 60 * 1000
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(this.utmParams))
      localStorage.setItem(UTM_EXPIRY_KEY, expiry.toString())
      console.log("[UTM Manager] 💾 UTMs salvos no localStorage com expiração em", UTM_EXPIRY_HOURS, "horas")
    } catch (error) {
      console.error("[UTM Manager] ❌ Erro ao salvar UTMs no storage:", error)
    }
  }

  private clearStorage(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(UTM_STORAGE_KEY)
    localStorage.removeItem(UTM_EXPIRY_KEY)
    this.utmParams = {}
  }

  public getUTMParams(): UTMParams {
    const params = { ...this.utmParams }

    // Se não há UTMs capturados, definir como tráfego direto/orgânico
    if (!this.hasUTMs()) {
      params.utm_source = "direct"
      params.utm_medium = "none"
    }

    return params
  }

  public hasUTMs(): boolean {
    return Object.values(this.utmParams).some((value) => value !== null && value !== undefined && value !== "")
  }

  public getUTMSummary(): string {
    const params = this.getUTMParams()
    const summary = []

    if (params.utm_source) summary.push(`Source: ${params.utm_source}`)
    if (params.utm_campaign) summary.push(`Campaign: ${params.utm_campaign}`)
    if (params.utm_medium) summary.push(`Medium: ${params.utm_medium}`)

    return summary.length > 0 ? summary.join(" | ") : "Tráfego direto"
  }

  // Método para forçar captura (útil para debug)
  public forceCaptureFromURL(): void {
    this.captureFromURL()
  }

  // Método para debug
  public debug(): void {
    console.log("[UTM Manager] 🔍 Debug Info:", {
      currentUTMs: this.utmParams,
      hasUTMs: this.hasUTMs(),
      summary: this.getUTMSummary(),
      storage: {
        stored: localStorage.getItem(UTM_STORAGE_KEY),
        expiry: localStorage.getItem(UTM_EXPIRY_KEY),
      },
    })
  }
}

// Função de conveniência para uso em componentes
export function getUTMParams(): UTMParams {
  return UTMManager.getInstance().getUTMParams()
}

export function hasUTMs(): boolean {
  return UTMManager.getInstance().hasUTMs()
}

export function getUTMSummary(): string {
  return UTMManager.getInstance().getUTMSummary()
}
