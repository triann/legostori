import { type NextRequest, NextResponse } from "next/server"

interface MetaEventData {
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
    order_id?: string
  }
  event_source_url: string
  action_source: string
}

export async function POST(request: NextRequest) {
  try {
    const eventData: MetaEventData = await request.json()

    eventData.user_data.client_ip_address =
      request.ip || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const pixelId = "14315111414682142"
    const accessToken =
      "EAAY1z45RfPQBPQ9PQex5YMxNdj675qLbGDeQ7i3OHTnNLztnW60VCu5rpfhWVkZB2zIT9rSkjParGJWoZA6F3WSsqoPtlcR04XNCG51TuTmKXwXOZB6s7yqZCB2VFBWoNq5ZCAktpPBulJvk2xJ63ks8PhiA42KHkUzKUiNIi6ljrTlmoyndFgsMycdfNrQZDZD"

    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [eventData],
        access_token: accessToken,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("[Meta Conversions API] Event sent successfully:", eventData.event_name)
      return NextResponse.json({
        success: true,
        event_name: eventData.event_name,
        event_id: eventData.event_id,
        result,
      })
    } else {
      console.error("[Meta Conversions API] Error:", result)
      return NextResponse.json(
        {
          error: "Failed to send to Meta",
          details: result,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[Meta Conversions API] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to process Meta conversion event",
      },
      { status: 500 },
    )
  }
}
