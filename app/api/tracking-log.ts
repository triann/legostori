import { type NextRequest, NextResponse } from "next/server"

interface TrackingLogEntry {
  id: string
  sessionId: string
  timestamp: string
  platform: string
  eventName: string
  status: string
  data: any
  userAgent: string
  ip?: string
  url: string
  referrer: string
}

// Simulação de banco de dados em memória (em produção usar banco real)
let trackingLogs: TrackingLogEntry[] = []

export async function POST(request: NextRequest) {
  try {
    const logEntry: TrackingLogEntry = await request.json()

    // Adicionar IP do usuário
    logEntry.ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

    // Armazenar log
    trackingLogs.push(logEntry)

    // Manter apenas os últimos 10000 logs para evitar memory leak
    if (trackingLogs.length > 10000) {
      trackingLogs = trackingLogs.slice(-10000)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Tracking Log API] Error:", error)
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"
    const platform = searchParams.get("platform")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const sessionId = searchParams.get("sessionId")

    let filteredLogs = [...trackingLogs]

    // Aplicar filtros
    if (platform) {
      filteredLogs = filteredLogs.filter((log) => log.platform === platform)
    }

    if (sessionId) {
      filteredLogs = filteredLogs.filter((log) => log.sessionId === sessionId)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= toDate)
    }

    // Ordenar por timestamp (mais recente primeiro)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (format === "csv") {
      const csv = convertToCSV(filteredLogs)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="tracking-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      total: filteredLogs.length,
      logs: filteredLogs,
    })
  } catch (error) {
    console.error("[Tracking Log API] Error:", error)
    return NextResponse.json({ error: "Failed to retrieve logs" }, { status: 500 })
  }
}

function convertToCSV(logs: TrackingLogEntry[]): string {
  if (logs.length === 0) return ""

  const headers = [
    "id",
    "sessionId",
    "timestamp",
    "platform",
    "eventName",
    "status",
    "data",
    "userAgent",
    "ip",
    "url",
    "referrer",
  ]
  const csvHeaders = headers.join(",")

  const csvRows = logs.map((log) => {
    return headers
      .map((header) => {
        let value = log[header as keyof TrackingLogEntry]
        if (typeof value === "object") {
          value = JSON.stringify(value)
        }
        return `"${String(value).replace(/"/g, '""')}"`
      })
      .join(",")
  })

  return [csvHeaders, ...csvRows].join("\n")
}
