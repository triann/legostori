import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Recebendo requisição de pagamento por cartão")
    const body = await request.json()
    console.log("[v0] Dados recebidos:", JSON.stringify(body, null, 2))

    const apiUrl = "https://monkeycheckout.online/vakinha-luky/pagamento-cartao.php"
    console.log("[v0] Fazendo requisição para:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] Status da resposta:", response.status)
    console.log("[v0] Headers da resposta:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Erro da API externa:", errorText)
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
    }

    const responseText = await response.text()
    console.log("[v0] Resposta da API externa:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.log("[v0] Erro ao fazer parse do JSON:", parseError)
      throw new Error(`Resposta inválida da API: ${responseText}`)
    }

    console.log("[v0] Dados processados:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Erro na API de pagamento:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
