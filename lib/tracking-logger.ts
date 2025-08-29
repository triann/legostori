export interface TrackingLog {
  timestamp: string
  platform: "meta" | "utmify" | "both"
  event: string
  data: any
  status: "success" | "error" | "pending"
  error?: string
}

class TrackingLogger {
  private logs: TrackingLog[] = []
  private maxLogs = 100

  log(
    platform: "meta" | "utmify" | "both",
    event: string,
    data: any,
    status: "success" | "error" | "pending" = "success",
    error?: string,
  ) {
    const logEntry: TrackingLog = {
      timestamp: new Date().toISOString(),
      platform,
      event,
      data,
      status,
      error,
    }

    this.logs.unshift(logEntry)

    // Manter apenas os últimos 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Log no console para debug
    console.log(`[v0 Tracking] ${platform.toUpperCase()} - ${event}:`, data)

    // Salvar no localStorage para persistência
    if (typeof window !== "undefined") {
      localStorage.setItem("v0_tracking_logs", JSON.stringify(this.logs))
    }
  }

  getLogs(): TrackingLog[] {
    return this.logs
  }

  getLogsByPlatform(platform: "meta" | "utmify"): TrackingLog[] {
    return this.logs.filter((log) => log.platform === platform || log.platform === "both")
  }

  clearLogs() {
    this.logs = []
    if (typeof window !== "undefined") {
      localStorage.removeItem("v0_tracking_logs")
    }
  }

  // Carregar logs do localStorage
  loadLogs() {
    if (typeof window !== "undefined") {
      const savedLogs = localStorage.getItem("v0_tracking_logs")
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs)
      }
    }
  }
}

export const trackingLogger = new TrackingLogger()

// Carregar logs salvos quando o módulo é importado
if (typeof window !== "undefined") {
  trackingLogger.loadLogs()
}
