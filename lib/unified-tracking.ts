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

    console.log(`[v0] UnifiedTracking.track called:`, {
      eventName,
      value,
      currency,
      contentIds,
      customData,
      sessionId: this.sessionId,
    })

    const eventKey = this.getEventKey(eventName, customData)
    if (this.trackedEvents.has(eventKey)) {
      console.log(`[v0] Duplicate event prevented: ${eventName}`, { eventKey })
      return
    }
    this.trackedEvents.add(eventKey)

    try {
      console.log(`[v0] Calling trackingLogger.log for ${eventName}`)
      trackingLogger.log("meta", eventName, { value, currency, contentIds, customData }, "pending")

      console.log(`[v0] Calling metaTracking.track for ${eventName}`)
      await metaTracking.track(eventName, {
        value,
        currency,
        content_ids: contentIds,
        ...customData,
      })

      console.log(`[v0] Successfully tracked ${eventName}, logging success`)
      trackingLogger.log("meta", eventName, { value, currency, content_ids: contentIds, ...customData }, "success")

      console.log(`[v0] Event ${eventName} completed successfully`)
    } catch (error) {
      console.error(`[v0] Error tracking ${eventName}:`, error)
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
  async trackPageView(url?: string) {
    console.log(`[v0] trackPageView called with URL:`, url)
    const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "server-side-render")
    await this.track({
      eventName: "PageView",
      customData: { url: currentUrl },
    })
  }

  async trackPuzzleStarted() {
    console.log(`[v0] trackPuzzleStarted called`)
    await this.track({ eventName: "PuzzleStarted" })
  }

  async trackPuzzleCompleted() {
    console.log(`[v0] trackPuzzleCompleted called`)
    await this.track({ eventName: "PuzzleCompleted" })
  }

  async trackCpfEntered() {
    console.log(`[v0] trackCpfEntered called`)
    await this.track({ eventName: "CpfEntered" })
  }

  async trackRouletteStarted() {
    console.log(`[v0] trackRouletteStarted called`)
    await this.track({ eventName: "RouletteStarted" })
  }

  async trackRouletteTermsAccepted() {
    console.log(`[v0] trackRouletteTermsAccepted called`)
    await this.track({ eventName: "RouletteTermsAccepted" })
  }

  async trackRouletteFirstSpin() {
    console.log(`[v0] trackRouletteFirstSpin called`)
    await this.track({ eventName: "RouletteFirstSpin" })
  }

  async trackRouletteDecision80() {
    console.log(`[v0] trackRouletteDecision80 called`)
    await this.track({
      eventName: "RouletteDecision80",
      customData: { decision: "take_80_percent" },
    })
  }

  async trackRouletteRiskAll() {
    console.log(`[v0] trackRouletteRiskAll called`)
    await this.track({
      eventName: "RouletteRiskAll",
      customData: { decision: "risk_all" },
    })
  }

  async trackRouletteResult80() {
    console.log(`[v0] trackRouletteResult80 called`)
    await this.track({
      eventName: "RouletteResult80",
      value: 80,
      customData: { final_discount: 80 },
    })
  }

  async trackRouletteResult100() {
    console.log(`[v0] trackRouletteResult100 called`)
    await this.track({
      eventName: "RouletteResult100",
      value: 100,
      customData: { final_discount: 100 },
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
    console.log(`[v0] trackAddToCart called with value:`, value, "productIds:", productIds)
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
    console.log(`[v0] trackCheckoutPersonalInfo called`)
    await this.trackCheckoutStep(2, "personal_info", { step_description: "Dados pessoais" })
  }

  async trackCheckoutDelivery() {
    console.log(`[v0] trackCheckoutDelivery called`)
    await this.trackCheckoutStep(3, "delivery", { step_description: "Informações de entrega" })
  }

  async trackCheckoutPayment() {
    console.log(`[v0] trackCheckoutPayment called`)
    await this.trackCheckoutStep(4, "payment", { step_description: "Método de pagamento" })
  }
}

export const unifiedTracking = new UnifiedTracking()
