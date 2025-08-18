const API_CONFIG = {
  API_BASE_URL: "https://monkeycheckout.online/vakinha-luky",
  // Secret key removida - está protegida no backend PHP
}

export interface PixPaymentData {
  amount: number
  email: string
  name: string
  phone: string
  cpf: string
  description: string
}

export interface PixResponse {
  success: boolean
  qrcode?: string
  token?: string
  error?: string
}

export interface PaymentStatus {
  success: boolean
  status: "PENDING" | "APPROVED" | "REJECTED"
  error?: string
}

// Função para criar pagamento PIX
export async function createPixPayment(data: PixPaymentData): Promise<PixResponse> {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/checkout.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: data.amount,
        email: data.email,
        name: data.name,
        phone: data.phone,
        cpf: data.cpf,
        description: data.description,
        method: "pix",
      }),
    })

    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        qrcode: result.qrcode,
        token: result.token,
      }
    } else {
      return {
        success: false,
        error: result.error || "Erro ao criar pagamento PIX",
      }
    }
  } catch (error) {
    console.error("Erro na API PIX:", error)
    return {
      success: false,
      error: "Erro de conexão com a API",
    }
  }
}

// Função para verificar status do pagamento
export async function checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/verificar.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idtransaction: transactionId,
      }),
    })

    const result = await response.json()

    return {
      success: result.success,
      status: result.status,
      error: result.error,
    }
  } catch (error) {
    console.error("Erro ao verificar status:", error)
    return {
      success: false,
      status: "PENDING",
      error: "Erro de conexão",
    }
  }
}

// Função para gerar QR Code
export function generateQRCodeUrl(pixCode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}&ecc=M&color=000000&bgcolor=FFFFFF&qzone=2&format=png`
}
