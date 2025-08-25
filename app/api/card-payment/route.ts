import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const debugInfo: any[] = []

  try {
    debugInfo.push("Recebendo requisição de pagamento por cartão")
    console.log("[v0] Recebendo requisição de pagamento por cartão")

    const body = await request.json()
    debugInfo.push(`Dados recebidos: ${JSON.stringify(body, null, 2)}`)
    console.log("[v0] Dados recebidos:", JSON.stringify(body, null, 2))

    const apiUrl = "https://monkeycheckout.online/vakinha-luky/pagamento-cartao.php"
    debugInfo.push(`Fazendo requisição para: ${apiUrl}`)
    console.log("[v0] Fazendo requisição para:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    debugInfo.push(`Status da resposta: ${response.status}`)
    debugInfo.push(`Headers da resposta: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`)
    console.log("[v0] Status da resposta:", response.status)
    console.log("[v0] Headers da resposta:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      debugInfo.push(`Erro da API externa: ${errorText}`)
      console.log("[v0] Erro da API externa:", errorText)

      return NextResponse.json(
        {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          details: errorText,
          debug: debugInfo,
        },
        { status: 500 },
      )
    }

    const responseText = await response.text()
    debugInfo.push(`Resposta da API externa: ${responseText}`)
    console.log("[v0] Resposta da API externa:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
      debugInfo.push(`Dados processados com sucesso`)
    } catch (parseError) {
      debugInfo.push(`Erro ao fazer parse do JSON: ${parseError}`)
      console.log("[v0] Erro ao fazer parse do JSON:", parseError)

      return NextResponse.json(
        {
          success: false,
          error: "Resposta inválida da API",
          details: responseText,
          debug: debugInfo,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Dados processados:", data)

    return NextResponse.json({
      ...data,
      debug: debugInfo,
    })
  } catch (error) {
    debugInfo.push(`Erro na API de pagamento: ${error}`)
    console.error("[v0] Erro na API de pagamento:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        debug: debugInfo,
      },
      { status: 500 },
    )
  }
}
