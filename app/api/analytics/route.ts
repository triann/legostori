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

// Simulação de banco de dados em memória (em produção, usar banco real)
const analyticsData: AnalyticsEvent[] = []
const sessions: Map<string, any> = new Map()
const users: Map<string, any> = new Map()

export async function POST(request: NextRequest) {
  try {
    const eventData: AnalyticsEvent = await request.json()

    // Validar dados obrigatórios
    if (!eventData.event || !eventData.session_id || !eventData.user_id) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 })
    }

    // Adicionar dados de geolocalização baseado no IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const enrichedEvent = {
      ...eventData,
      ip_address: ip,
      server_timestamp: Date.now(),
      // Adicionar dados de geolocalização (em produção, usar serviço de geolocalização)
      country: "BR",
      region: "Unknown",
      city: "Unknown",
    }

    // Armazenar evento
    analyticsData.push(enrichedEvent)

    // Atualizar dados da sessão
    const sessionData = sessions.get(eventData.session_id) || {
      session_id: eventData.session_id,
      user_id: eventData.user_id,
      start_time: eventData.timestamp,
      last_activity: eventData.timestamp,
      page_views: 0,
      events: 0,
      utm_source: eventData.utm_source,
      utm_medium: eventData.utm_medium,
      utm_campaign: eventData.utm_campaign,
      device_type: eventData.device_type,
      referrer: eventData.referrer,
    }

    sessionData.last_activity = eventData.timestamp
    sessionData.events += 1

    if (eventData.event === "page_view") {
      sessionData.page_views += 1
    }

    sessions.set(eventData.session_id, sessionData)

    // Atualizar dados do usuário
    const userData = users.get(eventData.user_id) || {
      user_id: eventData.user_id,
      first_seen: eventData.timestamp,
      last_seen: eventData.timestamp,
      total_sessions: 0,
      total_page_views: 0,
      total_events: 0,
      device_types: new Set(),
      utm_sources: new Set(),
    }

    userData.last_seen = eventData.timestamp
    userData.total_events += 1
    userData.device_types.add(eventData.device_type)

    if (eventData.utm_source) {
      userData.utm_sources.add(eventData.utm_source)
    }

    if (eventData.event === "page_view") {
      userData.total_page_views += 1
    }

    users.set(eventData.user_id, userData)

    // Log para debug (remover em produção)
    console.log(`[Analytics] ${eventData.event}:`, {
      user_id: eventData.user_id.substring(0, 8),
      session_id: eventData.session_id.substring(0, 8),
      page_url: eventData.page_url,
      properties: eventData.properties,
    })

    return NextResponse.json({ success: true, event_id: enrichedEvent.timestamp })
  } catch (error) {
    console.error("[Analytics API] Erro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "events"
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    let data: any[] = []

    switch (type) {
      case "events":
        data = analyticsData
          .filter((event) => {
            if (startDate && event.timestamp < new Date(startDate).getTime()) return false
            if (endDate && event.timestamp > new Date(endDate).getTime()) return false
            return true
          })
          .slice(-limit)
          .reverse()
        break

      case "sessions":
        data = Array.from(sessions.values()).slice(-limit).reverse()
        break

      case "users":
        data = Array.from(users.values()).slice(-limit).reverse()
        break

      case "stats":
        const now = Date.now()
        const last24h = now - 24 * 60 * 60 * 1000
        const last7d = now - 7 * 24 * 60 * 60 * 1000

        const events24h = analyticsData.filter((e) => e.timestamp > last24h)
        const events7d = analyticsData.filter((e) => e.timestamp > last7d)
        const sessions24h = Array.from(sessions.values()).filter((s) => s.last_activity > last24h)
        const sessions7d = Array.from(sessions.values()).filter((s) => s.last_activity > last7d)

        data = [
          {
            total_events: analyticsData.length,
            total_sessions: sessions.size,
            total_users: users.size,
            events_24h: events24h.length,
            events_7d: events7d.length,
            sessions_24h: sessions24h.length,
            sessions_7d: sessions7d.length,
            top_events: getTopEvents(events7d),
            top_pages: getTopPages(events7d),
            top_utm_sources: getTopUTMSources(events7d),
            device_breakdown: getDeviceBreakdown(events7d),
            conversion_funnel: getConversionFunnel(events7d),
          },
        ]
        break

      default:
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    return NextResponse.json({ data, total: data.length })
  } catch (error) {
    console.error("[Analytics API] Erro no GET:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Funções auxiliares para estatísticas
function getTopEvents(events: any[]) {
  const eventCounts: Record<string, number> = {}
  events.forEach((event) => {
    eventCounts[event.event] = (eventCounts[event.event] || 0) + 1
  })
  return Object.entries(eventCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([event, count]) => ({ event, count }))
}

function getTopPages(events: any[]) {
  const pageCounts: Record<string, number> = {}
  events
    .filter((e) => e.event === "page_view")
    .forEach((event) => {
      const url = new URL(event.page_url)
      const path = url.pathname
      pageCounts[path] = (pageCounts[path] || 0) + 1
    })
  return Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }))
}

function getTopUTMSources(events: any[]) {
  const sourceCounts: Record<string, number> = {}
  events.forEach((event) => {
    if (event.utm_source) {
      sourceCounts[event.utm_source] = (sourceCounts[event.utm_source] || 0) + 1
    }
  })
  return Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }))
}

function getDeviceBreakdown(events: any[]) {
  const deviceCounts: Record<string, number> = {}
  events.forEach((event) => {
    deviceCounts[event.device_type] = (deviceCounts[event.device_type] || 0) + 1
  })
  return Object.entries(deviceCounts).map(([device, count]) => ({ device, count }))
}

function getConversionFunnel(events: any[]) {
  const funnelEvents = ["page_view", "product_view", "add_to_cart", "checkout_start", "purchase"]
  const funnelCounts: Record<string, number> = {}

  funnelEvents.forEach((event) => {
    funnelCounts[event] = events.filter((e) => e.event === event).length
  })

  return funnelEvents.map((event) => ({
    step: event,
    count: funnelCounts[event] || 0,
    conversion_rate:
      funnelCounts["page_view"] > 0
        ? (((funnelCounts[event] || 0) / funnelCounts["page_view"]) * 100).toFixed(2)
        : "0.00",
  }))
}
