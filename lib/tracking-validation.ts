export class TrackingValidator {
  private events: Array<{
    timestamp: number
    eventName: string
    platform: "meta" | "utmify"
    data: any
    success: boolean
  }> = []

  logEvent(eventName: string, platform: "meta" | "utmify", data: any, success: boolean) {
    this.events.push({
      timestamp: Date.now(),
      eventName,
      platform,
      data,
      success,
    })

    console.log(`[v0] Tracking Event: ${eventName} on ${platform}`, {
      success,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  getEventsSummary() {
    const summary = {
      total: this.events.length,
      successful: this.events.filter((e) => e.success).length,
      failed: this.events.filter((e) => !e.success).length,
      byPlatform: {
        meta: this.events.filter((e) => e.platform === "meta").length,
        utmify: this.events.filter((e) => e.platform === "utmify").length,
      },
      byEvent: {} as Record<string, number>,
    }

    this.events.forEach((event) => {
      summary.byEvent[event.eventName] = (summary.byEvent[event.eventName] || 0) + 1
    })

    return summary
  }

  validateFunnelCompletion() {
    const requiredEvents = [
      "PageView",
      "PuzzleStarted",
      "PuzzleCompleted",
      "CpfEntered",
      "RouletteStarted",
      "DiscountClaimed",
    ]

    const eventNames = this.events.map((e) => e.eventName)
    const missingEvents = requiredEvents.filter((event) => !eventNames.includes(event))

    return {
      isComplete: missingEvents.length === 0,
      missingEvents,
      completedEvents: requiredEvents.filter((event) => eventNames.includes(event)),
      completionRate: ((requiredEvents.length - missingEvents.length) / requiredEvents.length) * 100,
    }
  }

  exportDebugData() {
    return {
      events: this.events,
      summary: this.getEventsSummary(),
      funnelValidation: this.validateFunnelCompletion(),
      timestamp: new Date().toISOString(),
    }
  }
}

export const trackingValidator = new TrackingValidator()

export function testTracking() {
  if (process.env.NODE_ENV !== "development") {
    console.warn("[v0] Tracking tests should only run in development")
    return
  }

  console.log("[v0] Starting tracking validation tests...")

  // Simular eventos do funil
  const testEvents = [
    { name: "PageView", data: {} },
    { name: "PuzzleStarted", data: { puzzle_type: "test" } },
    { name: "PuzzleCompleted", data: { moves: 10, errors: 2 } },
    { name: "CpfEntered", data: { cpf_length: 11 } },
    { name: "RouletteStarted", data: {} },
    { name: "DiscountClaimed", data: { value: 80 } },
  ]

  testEvents.forEach((event, index) => {
    setTimeout(() => {
      trackingValidator.logEvent(event.name, "meta", event.data, true)
      trackingValidator.logEvent(event.name, "utmify", event.data, true)

      if (index === testEvents.length - 1) {
        setTimeout(() => {
          console.log("[v0] Tracking validation complete:", trackingValidator.exportDebugData())
        }, 1000)
      }
    }, index * 500)
  })
}
