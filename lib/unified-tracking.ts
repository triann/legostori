import { metaTracking } from "./meta-tracking"
import { trackingLogger } from "./tracking-logger"
import { persistentLogger } from "./persistent-logger"

// Unified tracking system that combines Meta Ads and UTMify
export interface TrackingEventData {
  eventName: string
  value?: number
  currency?: string
  contentIds?: string[]
  customData?: Record<string, any>
}

export async function trackEvent(eventName: string, eventData: any = {}) {
  return await unifiedTracking.track({
    eventName,
    value: eventData.value,
    currency: eventData.currency || "BRL",
    contentIds: eventData.content_ids || eventData.contentIds || [],
    customData: eventData,
  })
}

class UnifiedTracking {
  private utmifyPixelId = "68a54ecdee66c77cb798c51c"
  private utmifyApiUrl = "https://api.utmify.com.br/api-credentials/orders"

  private async logEvent(platform: string, eventName: string, data: any, status: string, error?: string) {
    // Log to console (development)
    trackingLogger.log(platform, eventName, data, status, error)

    // Log to persistent storage (production)
    await persistentLogger.log({
      platform,
      eventName,
      data,
      status,
      error,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
    })
  }

  // Send event to UTMify
  private async sendUtmifyEvent(eventData: any) {
    try {
      await this.logEvent("utmify", eventData.eventName, eventData, "pending")

      // Send to UTMify pixel (client-side)
      if (typeof window !== "undefined" && (window as any).utmify) {
        ;(window as any).utmify("track", eventData.eventName, eventData)
        console.log("[v0] UTMify pixel event sent:", eventData.eventName)
      }

      // Send to UTMify API (server-side)
      const response = await fetch("/api/utmify-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        await this.logEvent("utmify", eventData.eventName, eventData, "success")
        console.log("[v0] UTMify API event sent:", eventData.eventName)
      } else {
        await this.logEvent("utmify", eventData.eventName, eventData, "error", `HTTP ${response.status}`)
        console.error("[v0] UTMify API error:", response.status)
      }
    } catch (error) {
      await this.logEvent(
        "utmify",
        eventData.eventName,
        eventData,
        "error",
        error instanceof Error ? error.message : "Unknown error",
      )
      console.error("[v0] UTMify tracking error:", error)
    }
  }

  // Main unified tracking method
  async track(eventData: TrackingEventData) {
    const { eventName, value, currency = "BRL", contentIds = [], customData = {} } = eventData

    try {
      await this.logEvent("both", eventName, { value, currency, contentIds, customData }, "pending")

      // Track with Meta Ads
      await metaTracking.track(eventName, {
        value,
        currency,
        content_ids: contentIds,
        ...customData,
      })

      await this.logEvent("meta", eventName, { value, currency, content_ids: contentIds, ...customData }, "success")

      // Track with UTMify
      await this.sendUtmifyEvent({
        eventName,
        value,
        currency,
        contentIds,
        customData,
        timestamp: Date.now(),
      })

      await this.logEvent("both", eventName, eventData, "success")
    } catch (error) {
      await this.logEvent(
        "both",
        eventName,
        eventData,
        "error",
        error instanceof Error ? error.message : "Unknown error",
      )
      throw error
    }
  }

  // Funnel-specific tracking methods
  async trackPageView() {
    await this.track({ eventName: "PageView" })
  }

  async trackPuzzleStarted() {
    await this.track({ eventName: "PuzzleStarted" })
  }

  async trackPuzzleCompleted() {
    await this.track({ eventName: "PuzzleCompleted" })
  }

  async trackCpfEntered() {
    await this.track({ eventName: "CpfEntered" })
  }

  async trackRouletteStarted() {
    await this.track({ eventName: "RouletteStarted" })
  }

  async trackDiscountClaimed(discountValue: number) {
    await this.track({
      eventName: "DiscountClaimed",
      value: discountValue,
      customData: { discount_percentage: discountValue },
    })
  }

  async trackViewContent(productName: string, productIds: string[] = []) {
    await this.track({
      eventName: "ViewContent",
      contentIds: productIds,
      customData: { content_name: productName },
    })
  }

  async trackAddToCart(value: number, productIds: string[] = []) {
    await this.track({
      eventName: "AddToCart",
      value,
      contentIds: productIds,
    })
  }

  async trackInitiateCheckout(value: number, numItems = 1) {
    await this.track({
      eventName: "InitiateCheckout",
      value,
      customData: { num_items: numItems },
    })
  }

  async trackPurchase(value: number, orderId: string, productIds: string[] = []) {
    await this.track({
      eventName: "Purchase",
      value,
      contentIds: productIds,
      customData: { order_id: orderId },
    })
  }

  // UTMify specific methods for conversion tracking
  async trackUtmifyPendingOrder(orderData: {
    valor: number
    nome: string
    email: string
    cpf: string
    telefone: string
    utm_params: Record<string, any>
  }) {
    try {
      await this.logEvent("utmify", "PendingOrder", orderData, "pending")

      const response = await fetch("/api/utmify-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        await this.logEvent("utmify", "PendingOrder", orderData, "success")
        console.log("[v0] UTMify pending order tracked")
      } else {
        await this.logEvent("utmify", "PendingOrder", orderData, "error", `HTTP ${response.status}`)
        console.error("[v0] UTMify pending order error:", response.status)
      }
    } catch (error) {
      await this.logEvent(
        "utmify",
        "PendingOrder",
        orderData,
        "error",
        error instanceof Error ? error.message : "Unknown error",
      )
      console.error("[v0] UTMify pending order error:", error)
    }
  }

  async trackUtmifyConversion(orderData: {
    transaction_id: string
    valor: number
    nome: string
    email: string
    cpf: string
    telefone: string
    utm_params: Record<string, any>
  }) {
    try {
      await this.logEvent("utmify", "Conversion", orderData, "pending")

      const response = await fetch("/api/utmify-conversion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        await this.logEvent("utmify", "Conversion", orderData, "success")
        console.log("[v0] UTMify conversion tracked")
      } else {
        await this.logEvent("utmify", "Conversion", orderData, "error", `HTTP ${response.status}`)
        console.error("[v0] UTMify conversion error:", response.status)
      }
    } catch (error) {
      await this.logEvent(
        "utmify",
        "Conversion",
        orderData,
        "error",
        error instanceof Error ? error.message : "Unknown error",
      )
      console.error("[v0] UTMify conversion error:", error)
    }
  }
}

export const unifiedTracking = new UnifiedTracking()
