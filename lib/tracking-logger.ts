import { persistentLogger } from "./persistent-logger"

export interface TrackingEvent {
  timestamp: string
  platform: "meta"
  eventName: string
  data: any
  status: "success" | "error" | "pending"
  error?: string
}

export interface TrackingLog {
  timestamp: string
  platform: "meta"
  event: string
  data: any
  status: "success" | "error" | "pending"
  error?: string
}

class TrackingLogger {
  private logs: TrackingLog[] = []
  private maxLogs = 100

  log(platform: "meta", event: string, data: any, status: "success" | "error" | "pending" = "success", error?: string) {
    const logEntry: TrackingLog = {
      timestamp: new Date().toISOString(),
      platform,
      event,
      data,
      status,
      error,
    }

    this.logs.unshift(logEntry)

    const trackingEvent: TrackingEvent = {
      timestamp: logEntry.timestamp,
      platform: logEntry.platform,
      eventName: logEntry.event,
      data: logEntry.data,
      status: logEntry.status,
      error: logEntry.error,
    }
    persistentLogger.log(trackingEvent)

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    console.log(`[v0 Tracking] ${platform.toUpperCase()} - ${event}:`, data)

    if (typeof window !== "undefined") {
      localStorage.setItem("v0_tracking_logs", JSON.stringify(this.logs))
    }
  }

  getLogs(): TrackingLog[] {
    return this.logs
  }

  clearLogs() {
    this.logs = []
    if (typeof window !== "undefined") {
      localStorage.removeItem("v0_tracking_logs")
    }
  }

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

if (typeof window !== "undefined") {
  trackingLogger.loadLogs()
}
