// Meta Pixel and Conversions API integration
export interface MetaEventData {
  event_name: string
  event_time: number
  event_id: string
  user_data: {
    em?: string
    ph?: string
    client_ip_address?: string
    client_user_agent?: string
    fbc?: string
    fbp?: string
  }
  custom_data?: {
    content_ids?: string[]
    content_type?: string
    content_name?: string
    value?: number
    currency?: string
    num_items?: number
  }
  event_source_url: string
  action_source: string
}

class MetaTracking {
  private pixelId = "14315111414682142"
  private accessToken =
    "EAAY1z45RfPQBPQ9PQex5YMxNdj675qLbGDeQ7i3OHTnNLztnW60VCu5rpfhWVkZB2zIT9rSkjParGJWoZA6F3WSsqoPtlcR04XNCG51TuTmKXwXOZB6s7yqZCB2VFBWoNq5ZCAktpPBulJvk2xJ63ks8PhiA42KHkUzKUiNIi6ljrTlmoyndFgsMycdfNrQZDZD"

  // Generate unique event ID for deduplication
  private generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get Facebook browser ID from cookie
  private getFbp(): string | undefined {
    if (typeof document === "undefined") return undefined
    const fbp = document.cookie.split("; ").find((row) => row.startsWith("_fbp="))
    return fbp ? fbp.split("=")[1] : undefined
  }

  // Get Facebook click ID from cookie
  private getFbc(): string | undefined {
    if (typeof document === "undefined") return undefined
    const fbc = document.cookie.split("; ").find((row) => row.startsWith("_fbc="))
    return fbc ? fbc.split("=")[1] : undefined
  }

  // Send event via Meta Pixel (client-side)
  private sendPixelEvent(eventName: string, eventData: any = {}, eventId: string) {
    if (typeof window !== "undefined" && (window as any).fbq) {
      ;(window as any).fbq("track", eventName, eventData, { eventID: eventId })
      console.log("[v0] Meta Pixel event sent:", eventName, eventData)
    }
  }

  // Send event via Conversions API (server-side)
  private async sendConversionsApiEvent(eventData: MetaEventData) {
    try {
      const response = await fetch("/api/meta-conversions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        console.log("[v0] Meta Conversions API event sent:", eventData.event_name)
      } else {
        console.error("[v0] Meta Conversions API error:", response.status)
      }
    } catch (error) {
      console.error("[v0] Meta Conversions API error:", error)
    }
  }

  // Main tracking method - sends to both Pixel and Conversions API
  async track(eventName: string, customData: any = {}) {
    const eventId = this.generateEventId()
    const eventTime = Math.floor(Date.now() / 1000)

    // Send via Meta Pixel (client-side)
    this.sendPixelEvent(eventName, customData, eventId)

    // Prepare data for Conversions API (server-side)
    const eventData: MetaEventData = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId,
      user_data: {
        client_ip_address: undefined, // Will be set server-side
        client_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        fbc: this.getFbc(),
        fbp: this.getFbp(),
      },
      custom_data: customData,
      event_source_url: typeof window !== "undefined" ? window.location.href : "",
      action_source: "website",
    }

    // Send via Conversions API (server-side)
    await this.sendConversionsApiEvent(eventData)
  }

  // Specific tracking methods for common events
  async trackPageView() {
    await this.track("PageView")
  }

  async trackViewContent(contentName: string, contentIds: string[] = []) {
    await this.track("ViewContent", {
      content_name: contentName,
      content_ids: contentIds,
      content_type: "product",
    })
  }

  async trackAddToCart(value: number, contentIds: string[] = []) {
    await this.track("AddToCart", {
      value: value,
      currency: "BRL",
      content_ids: contentIds,
      content_type: "product",
    })
  }

  async trackInitiateCheckout(value: number, numItems = 1) {
    await this.track("InitiateCheckout", {
      value: value,
      currency: "BRL",
      num_items: numItems,
    })
  }

  async trackPurchase(value: number, contentIds: string[] = [], orderId?: string) {
    await this.track("Purchase", {
      value: value,
      currency: "BRL",
      content_ids: contentIds,
      content_type: "product",
      order_id: orderId,
    })
  }

  // Custom events for our funnel
  async trackPuzzleStarted() {
    await this.track("PuzzleStarted")
  }

  async trackPuzzleCompleted() {
    await this.track("PuzzleCompleted")
  }

  async trackCpfEntered() {
    await this.track("CpfEntered")
  }

  async trackRouletteStarted() {
    await this.track("RouletteStarted")
  }

  async trackDiscountClaimed(discountValue: number) {
    await this.track("DiscountClaimed", {
      value: discountValue,
      currency: "BRL",
    })
  }
}

export const metaTracking = new MetaTracking()
