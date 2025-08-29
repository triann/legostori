import { type NextRequest, NextResponse } from "next/server"

const UTMIFY_API_URL = "https://api.utmify.com.br/api-credentials/orders"
const UTMIFY_PIXEL_ID = "68a54ecdee66c77cb798c51c"

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()

    // Send to UTMify API
    const response = await fetch(UTMIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Pixel-ID": UTMIFY_PIXEL_ID,
      },
      body: JSON.stringify({
        event: eventData.eventName,
        data: eventData,
        timestamp: eventData.timestamp || Date.now(),
        pixel_id: UTMIFY_PIXEL_ID,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("[v0] UTMify API success:", result)
      return NextResponse.json({ success: true, result })
    } else {
      console.error("[v0] UTMify API error:", result)
      return NextResponse.json({ success: false, error: result }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] UTMify API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
