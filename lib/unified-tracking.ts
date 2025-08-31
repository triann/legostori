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

  async trackInitiateCheckout(data: {
    content_ids?: string[]
    content_name?: string
    content_category?: string
    value: number
    currency?: string
    num_items?: number
    contents?: Array<{
      id: string
      quantity: number
      item_price: number
    }>
  }) {
    await this.track({
      eventName: "InitiateCheckout",
      value: data.value,
      currency: data.currency || "BRL",
      contentIds: data.content_ids || [],
      customData: {
        content_name: data.content_name,
        content_category: data.content_category,
        num_items: data.num_items || 1,
        contents: data.contents || [],
      },
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

  async trackProductView(productId: string, productName: string, productPrice: number) {
    await this.track({
      eventName: "ViewContent",
      value: productPrice,
      contentIds: [productId],
      customData: {
        content_name: productName,
        product_id: productId,
        product_price: productPrice,
      },
    })
  }

  async trackCheckoutStep(step: number, stepName: string, customData: any = {}) {
    await this.track({
      eventName: "CheckoutStep",
      customData: {
        checkout_step: step,
        step_name: stepName,
        ...customData,
      },
    })
  }

  async trackCheckoutPersonalInfo() {
    await this.trackCheckoutStep(2, "personal_info", { step_description: "Dados pessoais" })
  }

  async trackCheckoutDelivery() {
    await this.trackCheckoutStep(3, "delivery", { step_description: "Informações de entrega" })
  }

  async trackCheckoutPayment() {
    await this.trackCheckoutStep(4, "payment", { step_description: "Método de pagamento" })
  }
}

export const unifiedTracking = new UnifiedTracking()
