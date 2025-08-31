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

    if (!logEntry.eventName || !logEntry.sessionId) {
      console.error("[Tracking Log API] Missing required fields:", logEntry)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const rawIp = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    logEntry.ip = rawIp.split(",")[0].trim()

    console.log("[Tracking Log API] Attempting to save event:", logEntry.eventName)
    console.log("[Tracking Log API] Full log entry:", JSON.stringify(logEntry, null, 2))

    let timestamp
    try {
      timestamp = logEntry.timestamp ? new Date(logEntry.timestamp).toISOString() : new Date().toISOString()
    } catch (e) {
      console.error("[Tracking Log API] Invalid timestamp:", logEntry.timestamp)
      timestamp = new Date().toISOString()
    }

    const insertData = {
      event_name: logEntry.eventName,
      event_data: logEntry.data || {},
      session_id: logEntry.sessionId,
      user_agent: logEntry.userAgent || "unknown",
      ip_address: logEntry.ip,
      platform: logEntry.platform || "meta",
      status: logEntry.status || "success",
      created_at: timestamp,
    }

    console.log("[Tracking Log API] Insert data:", JSON.stringify(insertData, null, 2))

    const { data, error } = await supabase.from("tracking_logs").insert(insertData).select()

    if (error) {
      console.error("[Tracking Log API] Supabase error:", error)
      console.error("[Tracking Log API] Error details:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          error: "Failed to save to database",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 },
      )
    }

    console.log("[Tracking Log API] Event saved successfully:", logEntry.eventName)
    console.log("[Tracking Log API] Saved data:", JSON.stringify(data, null, 2))
    return NextResponse.json({
      success: true,
      received: logEntry.eventName,
      id: data?.[0]?.id,
    })
  } catch (error) {
    console.error("[Tracking Log API] Error:", error)
    console.error("[Tracking Log API] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json(
      {
        error: "Failed to log event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
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
