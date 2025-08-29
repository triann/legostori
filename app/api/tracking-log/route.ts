import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

export async function POST(request: NextRequest) {
  try {
    const logEntry: TrackingLogEntry = await request.json()
    const supabase = createClient()

    logEntry.ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

    const { data, error } = await supabase
      .from("tracking_logs")
      .insert({
        event_name: logEntry.eventName,
        event_data: logEntry.data,
        session_id: logEntry.sessionId,
        user_agent: logEntry.userAgent,
        ip_address: logEntry.ip,
        platform: logEntry.platform,
        status: logEntry.status,
        created_at: new Date(logEntry.timestamp).toISOString(),
      })
      .select()

    if (error) {
      console.error("[Tracking Log API] Supabase error:", error)
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 })
    }

    console.log("[Tracking Log API] Event saved to database:", logEntry.eventName)
    return NextResponse.json({ success: true, received: logEntry.eventName, id: data?.[0]?.id })
  } catch (error) {
    console.error("[Tracking Log API] Error:", error)
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    let query = supabase.from("tracking_logs").select("*").order("created_at", { ascending: false })

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      query = query.gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString())
    }

    const { data: logs, error } = await query

    if (error) {
      console.error("[Tracking Log API] Supabase error:", error)
      return NextResponse.json({ error: "Failed to retrieve logs" }, { status: 500 })
    }

    const transformedLogs =
      logs?.map((log) => ({
        id: log.id,
        sessionId: log.session_id,
        timestamp: log.created_at,
        platform: log.platform,
        eventName: log.event_name,
        status: log.status,
        data: log.event_data,
        userAgent: log.user_agent,
        ip: log.ip_address,
        url: log.event_data?.url || "",
        referrer: log.event_data?.referrer || "",
      })) || []

    return NextResponse.json(transformedLogs)
  } catch (error) {
    console.error("[Tracking Log API] Error:", error)
    return NextResponse.json({ error: "Failed to retrieve logs" }, { status: 500 })
  }
}
