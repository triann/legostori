import type { TrackingEvent } from "./tracking-logger"

interface StoredEvent extends TrackingEvent {
  id: string
  sessionId: string
  userAgent: string
  ip?: string
  url: string
  referrer: string
}

class PersistentLogger {
  private events: StoredEvent[] = []
  private sessionId: string
  private maxEvents = 1000 // Limite para evitar memory leak

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadFromStorage()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("tracking_events")
      if (stored) {
        this.events = JSON.parse(stored)
      }
    } catch (error) {
      console.error("[PersistentLogger] Error loading from storage:", error)
    }
  }

  private saveToStorage() {
    try {
      // Manter apenas os últimos 1000 eventos
      const eventsToSave = this.events.slice(-this.maxEvents)
      localStorage.setItem("tracking_events", JSON.stringify(eventsToSave))
      this.events = eventsToSave
    } catch (error) {
      console.error("[PersistentLogger] Error saving to storage:", error)
    }
  }

  log(event: TrackingEvent) {
    const storedEvent: StoredEvent = {
      ...event,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
    }

    this.events.push(storedEvent)
    this.saveToStorage()

    // Enviar para API em background
    this.sendToAPI(storedEvent)
  }

  private async sendToAPI(event: StoredEvent) {
    try {
      await fetch("/api/tracking-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error("[PersistentLogger] Error sending to API:", error)
    }
  }

  getEvents(filters?: {
    platform?: string
    status?: string
    dateFrom?: Date
    dateTo?: Date
  }): StoredEvent[] {
    let filteredEvents = [...this.events]

    if (filters?.platform) {
      filteredEvents = filteredEvents.filter((e) => e.platform === filters.platform)
    }

    if (filters?.status) {
      filteredEvents = filteredEvents.filter((e) => e.status === filters.status)
    }

    if (filters?.dateFrom) {
      filteredEvents = filteredEvents.filter((e) => new Date(e.timestamp) >= filters.dateFrom!)
    }

    if (filters?.dateTo) {
      filteredEvents = filteredEvents.filter((e) => new Date(e.timestamp) <= filters.dateTo!)
    }

    return filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  exportToJSON(): string {
    return JSON.stringify(this.events, null, 2)
  }

  exportToCSV(): string {
    if (this.events.length === 0) return ""

    const headers = Object.keys(this.events[0]).join(",")
    const rows = this.events.map((event) =>
      Object.values(event)
        .map((value) => (typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value))
        .join(","),
    )

    return [headers, ...rows].join("\n")
  }

  clear() {
    this.events = []
    localStorage.removeItem("tracking_events")
  }
}

export const persistentLogger = new PersistentLogger()
