"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckoutHeader } from "@/components/checkout-header"
import { createPixPayment, type PixPaymentData, maskCPF, maskPhone, validateEmail } from "@/lib/pix-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, X, Edit2, Loader2 } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice: number
  isFree: boolean
  image: string
  quantity: number
  description: string
  isDigital?: boolean
  requiresShipping?: boolean
}

export default function CheckoutUpsellPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [currentStep, setCurrentStep] = useState<"cart" | "email" | "personal" | "payment" | "processing" | "success">(
    "cart",
  )
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [cpf, setCpf] = useState("")
  const [phone, setPhone] = useState("")
  const [saveInfo, setSaveInfo] = useState(true)
  const [receivePromotions, setReceivePromotions] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")

  const [isLoading, setIsLoading] = useState(false)

  const [totalPrice, setTotalPrice] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    cpf: "",
    phone: "",
  })
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    const upsellData = localStorage.getItem("upsellProduct")
    if (upsellData) {
      const item = JSON.parse(upsellData)
      setCartItems([
        {
          id: 1,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice || item.price,
          isFree: false,
          image: item.image,
          quantity: 1,
          description: item.description || "Produto digital",
          isDigital: true,
          requiresShipping: false,
        },
      ])
      setTotalPrice(item.price)
      setProduct(item)
    }

    const previousPurchaseData = localStorage.getItem("pixPayment")
    if (previousPurchaseData) {
      const purchaseData = JSON.parse(previousPurchaseData)
      const firstName = purchaseData.name?.split(" ")[0] || ""
      const lastName = purchaseData.name?.split(" ").slice(1).join(" ") || ""
      const cpf = purchaseData.document || ""
      const phone = purchaseData.phone || ""

      setFormData({
        email: "",
        firstName: firstName,
        lastName: lastName,
        cpf: cpf,
        phone: phone,
      })
      setFirstName(firstName)
      setLastName(lastName)
      setCpf(cpf)
      setPhone(phone)
    }
  }, [])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.isFree ? 0 : item.price * item.quantity)
    }, 0)
  }

  const calculateShipping = () => {
    return 0
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const shipping = calculateShipping()
    const total = subtotal + shipping
    console.log("[v0] Cálculo do total:", { subtotal, shipping, total })
    return total
  }

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value)
    setCpf(masked)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value)
    setPhone(masked)
  }

  const handleContinueToEmail = () => {
    setCurrentStep("email")
  }

  const handleEmailSubmit = () => {
    if (!email.trim()) {
      setEmailError("E-mail é obrigatório")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("E-mail deve ter um formato válido")
      return
    }

    setEmailError("")
    setCurrentStep("personal")
    setFormData({ ...formData, email: email })
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.email.trim()) {
      errors.push("E-mail é obrigatório")
    } else if (!validateEmail(formData.email)) {
      errors.push("E-mail deve ter um formato válido")
    }

    if (!selectedPaymentMethod) {
      errors.push("Selecione um método de pagamento")
    }

    if (errors.length > 0) {
      alert("Erros encontrados:\n" + errors.join("\n"))
      return false
    }

    return true
  }

  const showTemporaryNotification = () => {
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  const handlePersonalSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || !cpf.trim() || !phone.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }
    setFormData({
      ...formData,
      firstName: firstName,
      lastName: lastName,
      cpf: cpf,
      phone: phone,
    })

    setCurrentStep("payment")
  }

  const handleProcessPayment = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const pixData: PixPaymentData = {
        amount: calculateTotal(),
        items: cartItems,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        document: cpf,
        phone: phone,
        saveInfo: saveInfo,
        receivePromotions: receivePromotions,
        paymentMethod: selectedPaymentMethod,
      }

      localStorage.setItem("pixPayment", JSON.stringify(pixData))

      const result = await createPixPayment(pixData)

      if (result.success) {
        const pixResponseData = {
          ...pixData,
          qrcode: result.qrcode,
          token: result.token,
          productName: cartItems[0]?.name || "Emissão de NF-e",
        }

        localStorage.setItem("pixPayment", JSON.stringify(pixResponseData))
        console.log("[v0] Dados da API PIX salvos:", pixResponseData)

        router.push("/pix")
      } else {
        throw new Error(result.error || "Erro ao processar pagamento")
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      setIsLoading(false)
    }
  }

  if (currentStep === "personal") {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <CheckoutHeader />

        <div className="max-w-md mx-auto bg-white min-h-screen transform transition-all duration-500 ease-in-out">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900 text-center">Emissão de NF-e</h1>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <h2 className="text-lg font-medium text-gray-900">Dados pessoais</h2>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Solicitamos apenas as informações essenciais para a realização da compra.
            </p>

            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className="w-full"
                  disabled
                />
              </div>

              <div>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Primeiro nome"
                  className="w-full"
                />
                {!firstName.trim() && <p className="text-xs text-red-500 mt-1">Campo obrigatório.</p>}
              </div>

              <div>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Último nome"
                  className="w-full"
                />
                {!lastName.trim() && <p className="text-xs text-red-500 mt-1">Campo obrigatório.</p>}
              </div>

              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                className="w-full"
              />

              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full"
              />

              <div className="space-y-3 pt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Salvar minhas informações para próximas compras.</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={receivePromotions}
                    onChange={(e) => setReceivePromotions(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Quero receber e-mails com promoções.</span>
                </label>
              </div>
            </div>

            <Button
              onClick={handlePersonalSubmit}
              disabled={!firstName.trim() || !lastName.trim() || !cpf.trim() || !phone.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold mt-8"
            >
              Ir para o Pagamento
            </Button>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          <p className="font-semibold text-orange-600 mb-2">FALE CONOSCO</p>
          <p className="mb-1">Telefone: (11) 3003-9030 - de segunda à sexta-feira, das 9h às 17h.</p>
          <p className="mb-4">
            M Shop Comercial LTDA | Rua Alexandre Dumas, 1630 - Chácara Santo Antônio - São Paulo/SP - CEP 04717-004 |
            CNPJ 01.490.698/0001-33 | Inscrição Estadual 115.012.872.118.
          </p>
          <div className="flex justify-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg/1200px-Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg.png?height=24&width=40&text=PIX"
              alt="PIX"
              className="h-6"
            />
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "payment") {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <CheckoutHeader />

        <div className="max-w-md mx-auto bg-white min-h-screen transform transition-all duration-500 ease-in-out">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900">Emissão de NF-e</h1>
          </div>

          <div className="p-4">
            {currentStep === "payment" && (
              <div className="space-y-6 mb-8">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        1
                      </div>
                      <h3 className="font-medium text-gray-900">Dados pessoais</h3>
                    </div>
                    <button onClick={() => setCurrentStep("personal")} className="text-blue-600 hover:text-blue-700">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="ml-9 text-sm text-gray-600">
                    <p>{formData.email}</p>
                    <p>
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p>{formData.phone}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Forma de pagamento</h3>

              <button
                onClick={() => setSelectedPaymentMethod("pix")}
                className={`w-full border-2 rounded-lg p-4 transition-colors ${
                  selectedPaymentMethod === "pix"
                    ? "border-blue-600 bg-white"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium ${selectedPaymentMethod === "pix" ? "text-blue-600" : "text-gray-900"}`}
                  >
                    Pix
                  </span>
                  <div className="w-10 h-6 flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg/1200px-Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg.png"
                      alt="pix logo"
                      className="h-full object contain"
                    ></img>
                  </div>
                </div>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do pedido</h3>

              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">Produto digital</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">R$ {(item.price / 100).toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {(calculateSubtotal() / 100).toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>R$ {(calculateTotal() / 100).toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
              <p>Aguardando confirmação para prosseguir com o pagamento...</p>
            </div>

            <Button
              onClick={handleProcessPayment}
              disabled={!selectedPaymentMethod || isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                "Gerar PIX"
              )}
            </Button>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          <p className="font-semibold text-orange-600 mb-2">FALE CONOSCO</p>
          <p className="mb-1">Telefone: (11) 3003-9030 - de segunda à sexta-feira, das 9h às 17h.</p>
          <p className="mb-4">
            M Shop Comercial LTDA | Rua Alexandre Dumas, 1630 - Chácara Santo Antônio - São Paulo/SP - CEP 04717-004 |
            CNPJ 01.490.698/0001-33 | Inscrição Estadual 115.012.872.118.
          </p>
          <div className="flex justify-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg/1200px-Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg.png"
              alt="PIX"
              className="h-6"
            />
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "email") {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <CheckoutHeader />

        <div className="max-w-md mx-auto bg-white min-h-screen transform transition-all duration-500 ease-in-out">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900 text-center">Emissão de NF-e</h1>
          </div>

          <div className="p-6 text-center">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Para finalizar a emissão, informe seu e-mail.</h2>
            <p className="text-sm text-gray-500 mb-8">Rápido. Fácil. Seguro.</p>

            <div className="mb-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`w-full text-center ${emailError ? "border-red-500" : ""}`}
              />
              {emailError && <p className="text-xs text-red-500 mt-2">{emailError}</p>}
            </div>

            <Button
              onClick={handleEmailSubmit}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold mb-4"
            >
              Continuar
            </Button>

            <div className="text-left mt-8">
              <p className="text-sm text-orange-600 font-medium mb-3">Usamos seu e-mail de forma 100% segura para:</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Identificar seu perfil
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Notificar sobre o andamento do seu pedido
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Gerenciar seu histórico de compras
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Acelerar o preenchimento de suas informações
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Envio da Nota Fiscal Eletrônica
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          <p className="font-semibold text-orange-600 mb-2">FALE CONOSCO</p>
          <p className="mb-1">Telefone: (11) 3003-9030 - de segunda à sexta-feira, das 9h às 17h.</p>
          <p className="mb-4">
            M Shop Comercial LTDA | Rua Alexandre Dumas, 1630 - Chácara Santo Antônio - São Paulo/SP - CEP 04717-004 |
            CNPJ 01.490.698/0001-33 | Inscrição Estadual 115.012.872.118.
          </p>
          <div className="flex justify-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg/1200px-Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg.png?height=24&width=40&text=PIX"
              alt="PIX"
              className="h-6"
            />
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "cart") {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <CheckoutHeader />

        {showNotification && (
          <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
            <div className="bg-orange-500 text-white px-4 py-3 text-center text-sm font-medium shadow-lg">
              <div className="max-w-md mx-auto flex items-center justify-between">
                <span>Essa opção não está disponível para esse produto.</span>
                <button
                  onClick={() => setShowNotification(false)}
                  className="ml-2 hover:bg-orange-600 rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-md mx-auto bg-white min-h-screen transform transition-all duration-500 ease-in-out">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900 text-center">Meu Carrinho</h1>
          </div>

          <div className="p-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 mb-6">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-medium text-gray-900 leading-tight">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className="text-blue-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-semibold">
                        R$ {(item.price / 100).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>

                  {item.quantity > 1 && <p className="text-xs text-red-500 mt-1">Limite de quantidade</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <div className="space-y-3 mb-6">
              <Button variant="outline" className="w-full bg-gray-400 text-white border-gray-400 hover:bg-gray-500">
                Adicionar Código de vendedor
              </Button>
              <Button variant="outline" className="w-full bg-gray-400 text-white border-gray-400 hover:bg-gray-500">
                Adicionar cupom de desconto
              </Button>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {(calculateSubtotal() / 100).toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>R$ {(calculateTotal() / 100).toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <Button
              onClick={handleContinueToEmail}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold mb-4"
            >
              Continuar
            </Button>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          <p className="font-semibold text-orange-600 mb-2">FALE CONOSCO</p>
          <p className="mb-1">Telefone: (11) 3003-9030 - de segunda à sexta-feira, das 9h às 17h.</p>
          <p className="mb-4">
            M Shop Comercial LTDA | Rua Alexandre Dumas, 1630 - Chácara Santo Antônio - São Paulo/SP - CEP 04717-004 |
            CNPJ 01.490.698/0001-33 | Inscrição Estadual 115.012.872.118.
          </p>
          <div className="flex justify-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg/1200px-Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg.png"
              alt="PIX"
              className="h-6"
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
