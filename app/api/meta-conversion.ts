import { type NextRequest, NextResponse } from "next/server"

const PIXEL_ID = "14315111414682142"
const ACCESS_TOKEN =
  "EAAY1z45RfPQBPQ9PQex5YMxNdj675qLbGDeQ7i3OHTnNLztnW60VCu5rpfhWVkZB2zIT9rSkjParGJWoZA6F3WSsqoPtlcR04XNCG51TuTmKXwXOZB6s7yqZCB2VFBWoNq5ZCAktpPBulJvk2xJ63ks8PhiA42KHkUzKUiNIi6ljrTlmoyndFgsMycdfNrQZDZD"

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()

    // Add server-side data
    eventData.user_data.client_ip_address =
      request.ip || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")

    // Send to Meta Conversions API
    const response = await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [eventData],
        access_token: ACCESS_TOKEN,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("[v0] Meta Conversions API success:", result)
      return NextResponse.json({ success: true, result })
    } else {
      console.error("[v0] Meta Conversions API error:", result)
      return NextResponse.json({ success: false, error: result }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Meta Conversions API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
