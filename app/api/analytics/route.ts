import { type NextRequest, NextResponse } from "next/server"

interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  timestamp: number
  session_id: string
  user_id: string
  page_url: string
  referrer: string
  user_agent: string
  device_type: "mobile" | "tablet" | "desktop"
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export async function POST(request: NextRequest) {
  try {
    const eventData: AnalyticsEvent = await request.json()

    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const serverTimestamp = new Date().toISOString()

    const logEntry = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      sessionId: eventData.session_id,
      timestamp: serverTimestamp,
      platform: "analytics",
      eventName: eventData.event,
      status: "success",
      data: {
        ...eventData.properties,
        user_id: eventData.user_id,
        device_type: eventData.device_type,
        utm_source: eventData.utm_source,
        utm_medium: eventData.utm_medium,
        utm_campaign: eventData.utm_campaign,
      },
      userAgent: eventData.user_agent,
      ip,
      url: eventData.page_url,
      referrer: eventData.referrer,
    }

    await fetch(`${request.nextUrl.origin}/api/tracking-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logEntry),
    }).catch((error) => {
      console.error("[Analytics API] Failed to log event:", error)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Analytics API] Error:", error)
    return NextResponse.json({ error: "Failed to process analytics event" }, { status: 500 })
  }
}
