interface CardPaymentData {
  amount: number
  email: string
  name: string
  phone: string
  cpf: string
  description: string
  card: {
    number: string
    holder_name: string
    exp_month: string
    exp_year: string
    cvv: string
  }
  installments: number
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  xcod?: string
  sck?: string
  utm_id?: string
}

interface CardPaymentResponse {
  success: boolean
  transaction_id?: string
  status?: string
  error?: string
}

export async function createCardPayment(data: CardPaymentData): Promise<CardPaymentResponse> {
  try {
    // Simulated API call - replace with actual payment gateway integration
    console.log("🔄 Processando pagamento por cartão...")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate successful payment (replace with actual API call)
    const response = {
      success: true,
      transaction_id: `card_${Date.now()}`,
      status: "approved",
    }

    return response
  } catch (error) {
    console.error("❌ Erro na API de pagamento:", error)
    return {
      success: false,
      error: "Erro ao processar pagamento por cartão",
    }
  }
}

// Export existing PIX function for compatibility
export { createPixPayment } from "./pix-api"
