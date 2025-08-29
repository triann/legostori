import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://" + request.headers.get("host")}/api-hostinger/webhook.php`

    // Format data as webhook event
    const webhookData = {
      objectId: orderData.transaction_id,
      data: {
        status: "paid",
        paymentMethod: "pix",
        amount: orderData.valor,
        customer: {
          name: orderData.nome,
          email: orderData.email,
          document: {
            number: orderData.cpf,
          },
          phone: orderData.telefone,
        },
        metadata: JSON.stringify(orderData.utm_params),
      },
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    const result = await response.text()

    if (response.ok) {
      console.log("[v0] UTMify conversion success")
      return NextResponse.json({ success: true, result })
    } else {
      console.error("[v0] UTMify conversion error:", response.status, result)
      return NextResponse.json({ success: false, error: result }, { status: response.status })
    }
  } catch (error) {
    console.error("[v0] UTMify conversion error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
