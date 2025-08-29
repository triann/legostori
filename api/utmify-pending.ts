import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    const utmifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://" + request.headers.get("host")}/api-hostinger/utmify-pendente.php`

    const response = await fetch(utmifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    const result = await response.text()

    if (response.ok) {
      console.log("[v0] UTMify pending order success")
      return NextResponse.json({ success: true, result })
    } else {
      console.error("[v0] UTMify pending order error:", response.status, result)
      return NextResponse.json({ success: false, error: result }, { status: response.status })
    }
  } catch (error) {
    console.error("[v0] UTMify pending order error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
