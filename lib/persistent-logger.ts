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
  private isClient = typeof window !== "undefined"
  private sentEventIds = new Set<string>()

  constructor() {
    this.sessionId = this.generateSessionId()
    if (this.isClient) {
      this.loadFromStorage()
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadFromStorage() {
    if (!this.isClient) return

    try {
      const stored = localStorage.getItem("tracking_events")
      if (stored) {
        const parsedEvents = JSON.parse(stored)
        const today = new Date().toISOString().split("T")[0]
        this.events = parsedEvents.filter((event: StoredEvent) => event.timestamp.startsWith(today))
      }

      const sentIds = localStorage.getItem("sent_event_ids")
      if (sentIds) {
        this.sentEventIds = new Set(JSON.parse(sentIds))
      }
    } catch (error) {
      console.error("[PersistentLogger] Error loading from storage:", error)
    }
  }

  private saveToStorage() {
    if (!this.isClient) return

    try {
      const eventsToSave = this.events.slice(-this.maxEvents)
      localStorage.setItem("tracking_events", JSON.stringify(eventsToSave))
      this.events = eventsToSave

      localStorage.setItem("sent_event_ids", JSON.stringify(Array.from(this.sentEventIds)))
    } catch (error) {
      console.error("[PersistentLogger] Error saving to storage:", error)
    }
  }

  log(event: TrackingEvent) {
    if (!this.isClient) return

    const eventKey = `${event.eventName}_${event.timestamp}_${this.sessionId}`
    const eventId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (this.sentEventIds.has(eventKey)) {
      return
    }

    const storedEvent: StoredEvent = {
      ...event,
      id: eventId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
    }

    this.events.push(storedEvent)
    this.saveToStorage()

    this.sentEventIds.add(eventKey)
    this.sendToAPI(storedEvent).catch(console.error)
  }

  private async sendToAPI(event: StoredEvent) {
    try {
      const response = await fetch("/api/tracking-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
    } catch (error) {
      console.error("[PersistentLogger] Error sending to API:", error)
      const eventKey = `${event.eventName}_${event.timestamp}_${event.sessionId}`
      this.sentEventIds.delete(eventKey)
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
    localStorage.removeItem("sent_event_ids")
  }

  getTodaysEvents(): StoredEvent[] {
    const today = new Date().toISOString().split("T")[0]
    return this.events.filter((event) => event.timestamp.startsWith(today))
  }

  getAccumulatedStats() {
    if (!this.isClient) return null

    try {
      const allEvents = localStorage.getItem("tracking_events")
      if (!allEvents) return null

      const events = JSON.parse(allEvents)
      return this.calculateStats(events)
    } catch (error) {
      console.error("[PersistentLogger] Error getting accumulated stats:", error)
      return null
    }
  }

  private calculateStats(events: StoredEvent[]) {
    const stats = {
      pageViews: 0,
      puzzleStarted: 0,
      puzzleCompleted: 0,
      cpfEntered: 0,
      rouletteStarted: 0,
      discountClaimed: 0,
      viewContent: 0,
      addToCart: 0,
      initiateCheckout: 0,
      purchase: 0,
      uniqueSessions: new Set(),
    }

    events.forEach((event) => {
      stats.uniqueSessions.add(event.sessionId)

      switch (event.eventName) {
        case "PageView":
          stats.pageViews++
          break
        case "PuzzleStarted":
          stats.puzzleStarted++
          break
        case "PuzzleCompleted":
          stats.puzzleCompleted++
          break
        case "CpfEntered":
          stats.cpfEntered++
          break
        case "RouletteStarted":
          stats.rouletteStarted++
          break
        case "DiscountClaimed":
          stats.discountClaimed++
          break
        case "ViewContent":
          stats.viewContent++
          break
        case "AddToCart":
          stats.addToCart++
          break
        case "InitiateCheckout":
          stats.initiateCheckout++
          break
        case "Purchase":
          stats.purchase++
          break
      }
    })

    return {
      ...stats,
      uniqueSessions: stats.uniqueSessions.size,
    }
  }
}

export const persistentLogger = new PersistentLogger()
