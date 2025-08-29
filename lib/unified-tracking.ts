import { metaTracking } from "./meta-tracking"
import { trackingLogger } from "./tracking-logger"

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
  private trackedEvents = new Set<string>()
  private sessionId = this.generateSessionId()

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getEventKey(eventName: string, customData: any = {}): string {
    const timestamp = Math.floor(Date.now() / 1000) // Round to seconds to allow some duplicates
    return `${this.sessionId}_${eventName}_${timestamp}`
  }

  async track(eventData: TrackingEventData) {
    const { eventName, value, currency = "BRL", contentIds = [], customData = {} } = eventData

    const eventKey = this.getEventKey(eventName, customData)
    if (this.trackedEvents.has(eventKey)) {
      console.log(`[v0] Duplicate event prevented: ${eventName}`)
      return
    }
    this.trackedEvents.add(eventKey)

    try {
      trackingLogger.log("meta", eventName, { value, currency, contentIds, customData }, "pending")

      await metaTracking.track(eventName, {
        value,
        currency,
        content_ids: contentIds,
        ...customData,
      })

      trackingLogger.log("meta", eventName, { value, currency, content_ids: contentIds, ...customData }, "success")
    } catch (error) {
      trackingLogger.log(
        "meta",
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
}

export const unifiedTracking = new UnifiedTracking()
