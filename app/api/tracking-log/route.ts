import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

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

const LOGS_FILE_PATH = path.join(process.cwd(), "data", "tracking-logs.json")

// Função para garantir que o diretório existe
async function ensureDataDirectory() {
  const dataDir = path.dirname(LOGS_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Função para carregar logs existentes
async function loadLogs(): Promise<TrackingLogEntry[]> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(LOGS_FILE_PATH, "utf-8")
    return JSON.parse(data)
  } catch {
    // Se arquivo não existe ou erro de parsing, retorna array vazio
    return []
  }
}

// Função para salvar logs
async function saveLogs(logs: TrackingLogEntry[]): Promise<void> {
  try {
    await ensureDataDirectory()
    await fs.writeFile(LOGS_FILE_PATH, JSON.stringify(logs, null, 2))
  } catch (error) {
    console.error("[Tracking Log API] Error saving logs:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const logEntry: TrackingLogEntry = await request.json()

    // Adicionar IP do usuário
    logEntry.ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

    const existingLogs = await loadLogs()
    existingLogs.push(logEntry)

    // Manter apenas os últimos 50000 logs para evitar arquivo muito grande
    const logsToKeep = existingLogs.slice(-50000)

    await saveLogs(logsToKeep)

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
    const date = searchParams.get("date")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const sessionId = searchParams.get("sessionId")

    let filteredLogs = await loadLogs()

    // Aplicar filtros
    if (platform) {
      filteredLogs = filteredLogs.filter((log) => log.platform === platform)
    }

    if (sessionId) {
      filteredLogs = filteredLogs.filter((log) => log.sessionId === sessionId)
    }

    if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

      filteredLogs = filteredLogs.filter((log) => {
        const logDate = new Date(log.timestamp)
        return logDate >= startOfDay && logDate < endOfDay
      })
    } else {
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= fromDate)
      }

      if (dateTo) {
        const toDate = new Date(dateTo)
        filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= toDate)
      }
    }

    // Ordenar por timestamp (mais recente primeiro)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (format === "csv") {
      const csv = convertToCSV(filteredLogs)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="tracking-logs-${date || new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json(filteredLogs)
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
