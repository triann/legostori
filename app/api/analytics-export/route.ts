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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const format = searchParams.get("format") || "json"

    let logsUrl = `${request.nextUrl.origin}/api/tracking-log`
    if (date) {
      const dateFrom = `${date}T00:00:00.000Z`
      const dateTo = `${date}T23:59:59.999Z`
      logsUrl += `?dateFrom=${dateFrom}&dateTo=${dateTo}`
    }

    const response = await fetch(logsUrl)
    if (!response.ok) {
      throw new Error("Failed to fetch logs")
    }

    const { logs } = await response.json()

    const stats = calculateFunnelStats(logs)

    if (format === "csv") {
      const csv = convertToCSV(logs, stats)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="analytics-export-${date || "today"}.csv"`,
        },
      })
    }

    return NextResponse.json({
      date: date || new Date().toISOString().split("T")[0],
      total_events: logs.length,
      funnel_stats: stats,
      logs: logs.slice(0, 1000), // Limitar a 1000 logs para performance
    })
  } catch (error) {
    console.error("[Analytics Export API] Error:", error)
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 })
  }
}

function calculateFunnelStats(logs: TrackingLogEntry[]) {
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
    platforms: {} as Record<string, number>,
    errors: 0,
  }

  logs.forEach((log) => {
    stats.uniqueSessions.add(log.sessionId)
    stats.platforms[log.platform] = (stats.platforms[log.platform] || 0) + 1

    if (log.status === "error") {
      stats.errors++
      return
    }

    switch (log.eventName) {
      case "page_view":
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
    conversionRates: {
      puzzleCompletion:
        stats.puzzleStarted > 0 ? ((stats.puzzleCompleted / stats.puzzleStarted) * 100).toFixed(2) : "0.00",
      discountClaim: stats.cpfEntered > 0 ? ((stats.discountClaimed / stats.cpfEntered) * 100).toFixed(2) : "0.00",
      finalConversion: stats.pageViews > 0 ? ((stats.purchase / stats.pageViews) * 100).toFixed(2) : "0.00",
    },
  }
}

function convertToCSV(logs: TrackingLogEntry[], stats: any): string {
  const headers = ["timestamp", "platform", "eventName", "status", "sessionId", "data", "userAgent", "url"]
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

  const statsRows = [
    "",
    "=== ESTATÍSTICAS DO FUNIL ===",
    `Page Views,${stats.pageViews}`,
    `Puzzle Started,${stats.puzzleStarted}`,
    `Puzzle Completed,${stats.puzzleCompleted}`,
    `CPF Entered,${stats.cpfEntered}`,
    `Discount Claimed,${stats.discountClaimed}`,
    `Purchases,${stats.purchase}`,
    `Unique Sessions,${stats.uniqueSessions}`,
    `Puzzle Completion Rate,${stats.conversionRates.puzzleCompletion}%`,
    `Final Conversion Rate,${stats.conversionRates.finalConversion}%`,
    "",
    "=== LOGS DETALHADOS ===",
  ]

  return [...statsRows, csvHeaders, ...csvRows].join("\n")
}
