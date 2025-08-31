"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PuzzleGame } from "@/components/puzzle-game"
import { unifiedTracking } from "@/lib/unified-tracking"
import {
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trophy,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  rating: number
  reviews: number
  ages: string
  pieces: number
  itemNumber: string
  vipPoints: number
  images: string[]
  description: string
  inStock: boolean
  puzzleImage: string
  puzzleTimeLimit: number
  puzzleDiscount: number
}

interface ProductDetailsProps {
  product: Product
  discount?: number // Added discount prop from roulette
}

export function ProductDetails({ product, discount = 0 }: ProductDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [showPuzzle, setShowPuzzle] = useState(false)
  const [showPuzzleComplete, setShowPuzzleComplete] = useState(false)
  const [puzzleResult, setPuzzleResult] = useState<{
    type: "discount" | "free"
    value: number
    productName?: string
  } | null>(null)
  const [cpf, setCpf] = useState("")
  const [showCpfInput, setShowCpfInput] = useState(false)
  const router = useRouter()

  useEffect(() => {
    unifiedTracking.trackProductView(product.id, product.name, product.price)
  }, [product])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const isMobile = window.innerWidth < 768
    console.log(`[UTM] handleAddToCart - Dispositivo: ${isMobile ? "Mobile" : "Desktop"}`)

    const savedUtmParams = localStorage.getItem("utmParams")
    let utmParams = {}
    if (savedUtmParams) {
      try {
        utmParams = JSON.parse(savedUtmParams)
        console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - UTM carregados para checkout:`, utmParams)
      } catch (e) {
        console.error(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Erro ao parsear UTM params do localStorage:`, e)
      }
    } else {
      console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Nenhum UTM encontrado no localStorage`)
    }

    const checkoutData = {
      id: product.id,
      name: product.name,
      image: product.images[0],
      originalPrice: product.price,
      finalPrice: discount === 100 ? 0 : product.price * (1 - discount / 100),
      isFree: discount === 100,
      discount: discount,
      itemNumber: product.itemNumber,
      pieces: product.pieces,
      ages: product.ages,
      utmParams: utmParams,
    }

    localStorage.setItem("checkoutProduct", JSON.stringify(checkoutData))

    const urlParams = new URLSearchParams(window.location.search)
    const utmParamsFromUrl = new URLSearchParams()

    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "src",
      "sck",
      "xcod",
      "fbclid",
      "gclid",
    ]

    if (Object.keys(utmParams).length > 0) {
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value && utmKeys.includes(key)) {
          utmParamsFromUrl.set(key, value as string)
        }
      })
      console.log(
        `[UTM] ${isMobile ? "Mobile" : "Desktop"} - Usando UTM do localStorage na URL:`,
        Object.fromEntries(utmParamsFromUrl.entries()),
      )
    } else {
      utmKeys.forEach((key) => {
        const value = urlParams.get(key)
        if (value) {
          utmParamsFromUrl.set(key, value)
        }
      })
      console.log(
        `[UTM] ${isMobile ? "Mobile" : "Desktop"} - Usando UTM da URL atual:`,
        Object.fromEntries(utmParamsFromUrl.entries()),
      )
    }

    const checkoutUrl = utmParamsFromUrl.toString() ? `/checkout?${utmParamsFromUrl.toString()}` : "/checkout"
    console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Redirecionando para:`, checkoutUrl)

    router.push(checkoutUrl)

    setIsAddingToCart(false)
  }

  const handleAddToWishlist = async () => {
    setIsAddingToWishlist(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAddingToWishlist(false)
  }

  const handleStartPuzzle = () => {
    unifiedTracking.trackPuzzleStarted()
    setShowPuzzle(true)
  }

  const handlePuzzleComplete = (
    result: { type: "discount" | "free"; value: number; productName?: string },
    moves: number,
    errors: number,
  ) => {
    unifiedTracking.trackPuzzleCompleted()
    setPuzzleResult(result)
    setShowPuzzle(false)
    setShowPuzzleComplete(true)
  }

  const handleCpfConfirm = () => {
    if (cpf.length >= 11) {
      unifiedTracking.trackCpfEntered()

      localStorage.setItem("puzzleCompleted", "true")
      localStorage.setItem("discountEarned", puzzleResult?.value.toString() || "80")
      localStorage.setItem("discountType", puzzleResult?.type || "discount")
      localStorage.setItem("productId", product.id)
      localStorage.setItem("userCpf", cpf)

      router.push("/roulette")
    }
  }

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    setCpf(formatted)
  }

  if (showPuzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('https://i.ibb.co/5Xhm2BC8/bg.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay relative">
        <div className="flex items-end pb-8 justify-center min-h-screen p-1">
          <PuzzleGame
            image={product.puzzleImage}
            onComplete={handlePuzzleComplete}
            onClose={() => setShowPuzzle(false)}
            productName={product.name}
            discount={product.puzzleDiscount}
            originalPrice={product.price}
            discountedPrice={product.price * (1 - product.puzzleDiscount / 100)}
            timeLimit={product.puzzleTimeLimit}
            currentPuzzle={1}
            totalPuzzles={1}
          />
        </div>
      </div>
    )
  }

  if (showPuzzleComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('https://i.ibb.co/5Xhm2BC8/bg.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay flex items-center justify-center p-3">
        <div className="max-w-sm w-full bg-white/95 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900">Parabéns!</h1>
            </div>
            <p className="text-sm text-gray-700">Você completou o quebra-cabeça do {product.name}!</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-red-600" />
              <h3 className="text-base font-semibold text-red-800">Resgate seu Prêmio</h3>
            </div>
            <p className="text-xs text-red-700 mb-3">
              Insira seu CPF para girar a roleta da sorte. <strong>O resgate é único por CPF.</strong>
            </p>

            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
              maxLength={14}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3 text-center font-mono text-base"
            />

            <button
              onClick={handleCpfConfirm}
              disabled={cpf.replace(/\D/g, "").length < 11}
              className={`w-full py-2 px-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 text-sm ${
                cpf.replace(/\D/g, "").length >= 11
                  ? "bg-red-600 hover:bg-red-700 hover:scale-105"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {cpf.replace(/\D/g, "").length >= 11 ? (
                <>
                  <Target className="w-4 h-4" />
                  Confirmar e Girar Roleta
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Digite seu CPF
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Seus dados estão seguros e serão usados apenas para validação do prêmio.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
      <nav className="text-sm text-gray-600 mb-6">
        <span>Início</span> / <span>Loja</span> / <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div
              className="relative bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center mx-auto"
              style={{ width: "293px", height: "370px" }}
            >
              <img
                src={product.images[currentImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="object-contain max-w-full max-h-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded border-2 overflow-hidden ${
                  index === currentImageIndex ? "border-blue-500" : "border-gray-200"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{product.name}</h1>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 flex-wrap">
              <span>{product.ages}</span>
              <span>•</span>
              <span>{product.pieces} peças</span>
              <span>•</span>
              <span>Item {product.itemNumber}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-gray-600 text-sm">({product.reviews} avaliações)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {discount > 0 ? (
                <>
                  <div className="text-xl sm:text-2xl font-bold text-green-600 break-words">
                    {discount === 100 ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span>GRÁTIS!</span>
                        <Badge className="bg-green-100 text-green-800 w-fit">PRODUTO GRÁTIS!</Badge>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span>R$ {(product.price * (1 - discount / 100)).toFixed(2)}</span>
                        <Badge className="bg-green-100 text-green-800 w-fit">{discount}% DESCONTO!</Badge>
                      </div>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold line-through text-gray-500">
                    R$ {product.price.toFixed(2)}
                  </div>
                </>
              ) : (
                <div className="text-xl sm:text-2xl font-bold">R$ {product.price.toFixed(2)}</div>
              )}
            </div>
            <p className="text-sm text-gray-600">Ganhe {product.vipPoints} pontos VIP</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-lg text-red-800">Desafio do Quebra-Cabeça</h3>
            </div>
            <p className="text-sm text-red-700 mb-4">
              Complete o quebra-cabeça deste produto e ganhe até <strong>{product.puzzleDiscount}% de desconto</strong>{" "}
              ou até mesmo o <strong>produto GRÁTIS</strong> na roleta da sorte!
            </p>
            <Button
              onClick={handleStartPuzzle}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all hover:scale-105 animate-pulse shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Começar Quebra-Cabeça
            </Button>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base sm:text-lg py-4 sm:py-6 rounded-full font-semibold disabled:opacity-50"
              disabled={!product.inStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : !product.inStock ? (
                "Fora de estoque"
              ) : discount === 100 ? (
                "Resgatar Produto Grátis"
              ) : (
                `Adicionar à sacola - R$ {(product.price * (1 - discount / 100)).toFixed(2)}`
              )}
            </Button>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent disabled:opacity-50"
                disabled={isAddingToWishlist}
                onClick={handleAddToWishlist}
              >
                {isAddingToWishlist ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Adicionar à lista de desejos
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1 rounded-full bg-transparent">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Descrição</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Avaliações dos clientes</h3>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    M
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Marina S.</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      "mto bom!! consegui ganhar 80% na roleta e valeu demais. achei q era pegadinha mas é real msm.
                      qualidade lego sempre perfeita né"
                    </p>
                    <span className="text-xs text-gray-500">Há 2 dias</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    R
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Roberto L.</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      "cara nao acreditei qnd ganhei o produto GRATIS na roleta kkkkk pensei q era fake mas chegou td
                      certinho! a roleta é real e os descontos também"
                    </p>
                    <span className="text-xs text-gray-500">Há 1 semana</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Ana C.</span>
                      <div className="flex">
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      "meu filho amou!! conseguimos 80% na primeira tentativa da roleta. mt legal essa dinamica do jogo,
                      deixa a compra mais divertida. chegou rapidinho"
                    </p>
                    <span className="text-xs text-gray-500">Há 3 dias</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                    C
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Carlos M.</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      "experiencia unica cara! nunca vi uma loja assim com essa roleta. ganhei produto gratis e chegou
                      super rapido. lego sempre inovando 👏"
                    </p>
                    <span className="text-xs text-gray-500">Há 5 dias</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
