"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Share2, ChevronLeft, ChevronRight, Puzzle, Clock, Gift, Loader2 } from "lucide-react"
import { PuzzleGame } from "@/components/puzzle-game"

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
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showPuzzle, setShowPuzzle] = useState(false)
  const [puzzleCompleted, setPuzzleCompleted] = useState(false)
  const [rouletteResult, setRouletteResult] = useState<{
    type: "discount" | "free"
    value: number
    productName?: string
  } | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const router = useRouter()

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const handleRouletteComplete = (result: { type: "discount" | "free"; value: number; productName?: string }) => {
    setPuzzleCompleted(true)
    setRouletteResult(result)
    setShowPuzzle(false)
  }

  const finalPrice =
    rouletteResult?.type === "free"
      ? 0
      : rouletteResult?.type === "discount"
        ? product.price * (1 - rouletteResult.value / 100)
        : product.price

  if (showPuzzle) {
    return (
      <PuzzleGame
        image={product.puzzleImage}
        timeLimit={product.puzzleTimeLimit}
        onComplete={handleRouletteComplete}
        onClose={() => setShowPuzzle(false)}
        productName={product.name}
        discount={product.puzzleDiscount}
        originalPrice={product.price}
        discountedPrice={product.price * (1 - product.puzzleDiscount / 100)}
      />
    )
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const savedUtmParams = localStorage.getItem("utmParams")
    let utmParams = {}
    if (savedUtmParams) {
      try {
        utmParams = JSON.parse(savedUtmParams)
      } catch (e) {
        console.log("Erro ao parsear UTM params do localStorage")
      }
    }

    const checkoutData = {
      id: product.id,
      name: product.name,
      image: product.images[0],
      originalPrice: product.price,
      finalPrice: finalPrice,
      isFree: rouletteResult?.type === "free",
      discount: rouletteResult?.type === "discount" ? rouletteResult.value : 0,
      itemNumber: product.itemNumber,
      pieces: product.pieces,
      ages: product.ages,
      utmParams: utmParams,
    }

    // Salvar no localStorage para acessar no checkout
    localStorage.setItem("checkoutProduct", JSON.stringify(checkoutData))

    // Capturar UTM's da URL atual
    const urlParams = new URLSearchParams(window.location.search)
    const utmParamsFromUrl = new URLSearchParams()

    // Adicionar todos os parâmetros UTM encontrados na URL atual
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
    utmKeys.forEach((key) => {
      const value = urlParams.get(key)
      if (value) {
        utmParamsFromUrl.set(key, value)
      }
    })

    // Redirecionar para o checkout preservando UTM's na URL
    const checkoutUrl = utmParamsFromUrl.toString() ? `/checkout?${utmParamsFromUrl.toString()}` : "/checkout"

    router.push(checkoutUrl)

    setIsAddingToCart(false)
  }

  const handleAddToWishlist = async () => {
    setIsAddingToWishlist(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAddingToWishlist(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Início</span> / <span>Loja</span> / <span>Transformers</span> /{" "}
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Product Images */}
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

          {/* Thumbnail images */}
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

        {/* Product Info */}
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

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {rouletteResult && (
                <div className="text-xl sm:text-2xl font-bold text-green-600 break-words">
                  {rouletteResult.type === "free" ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span>GRÁTIS!</span>
                      <Badge className="bg-green-100 text-green-800 w-fit">PRODUTO GRÁTIS!</Badge>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span>R$ {finalPrice.toFixed(2)}</span>
                      <Badge className="bg-green-100 text-green-800 w-fit">{rouletteResult.value}% DESCONTO!</Badge>
                    </div>
                  )}
                </div>
              )}
              <div className={`text-xl sm:text-2xl font-bold ${rouletteResult ? "line-through text-gray-500" : ""}`}>
                R$ {product.price.toFixed(2)}
              </div>
            </div>
            <p className="text-sm text-gray-600">Ganhe {product.vipPoints} pontos VIP</p>
          </div>

          {/* Puzzle Challenge Card */}
          {!puzzleCompleted && (
            <Card className="border-2 border-yellow-400 bg-yellow-50 mx-2 sm:mx-0">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-yellow-400 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <Puzzle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-2 text-yellow-800">
                      🧩 Desafio do Quebra-Cabeça!
                    </h3>
                    <p className="text-yellow-700 mb-3 text-sm sm:text-base">
                      Complete o quebra-cabeça do {product.name} e ganhe o direito de girar a
                      <strong> Roleta da Sorte</strong> com prêmios incríveis!
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-yellow-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          Tempo limite: {Math.floor(product.puzzleTimeLimit / 60)}:
                          {(product.puzzleTimeLimit % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span>Prêmios: Descontos até 70% ou produto grátis!</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowPuzzle(true)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold w-full sm:w-auto text-sm sm:text-base"
                    >
                      Iniciar Desafio do Quebra-Cabeça
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card de sucesso baseado no resultado da roleta */}
          {puzzleCompleted && rouletteResult && (
            <Card className="border-2 border-green-400 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Gift className="w-5 h-5" />
                  <span className="font-semibold">
                    {rouletteResult.type === "free"
                      ? `Parabéns! Você ganhou o ${rouletteResult.productName || product.name} GRÁTIS!`
                      : `Parabéns! Você ganhou ${rouletteResult.value}% de desconto neste produto!`}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
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
              ) : rouletteResult?.type === "free" ? (
                "Resgatar Produto Grátis"
              ) : (
                `Adicionar à sacola - R$ ${finalPrice.toFixed(2)}`
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

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Descrição</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Customer Reviews */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Avaliações dos clientes</h3>
            <div className="space-y-4">
              {/* Review 1 */}
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
                      "mto bom!! consegui ganhar 70% no quebra cabeça e valeu demais. achei q era pegadinha mas é real
                      msm. qualidade lego sempre perfeita né"
                    </p>
                    <span className="text-xs text-gray-500">Há 2 dias</span>
                  </div>
                </div>
              </Card>

              {/* Review 2 */}
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
                      certinho! o quebra cabeça é legal e a promoção é real"
                    </p>
                    <span className="text-xs text-gray-500">Há 1 semana</span>
                  </div>
                </div>
              </Card>

              {/* Review 3 */}
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
                      "meu filho amou!! conseguimos 50% na primeira tentativa da roleta. mt legal essa dinamica do jogo,
                      deixa a compra mais divertida. só achei o quebra cabeça meio dificil"
                    </p>
                    <span className="text-xs text-gray-500">Há 3 dias</span>
                  </div>
                </div>
              </Card>

              {/* Review 4 */}
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
                      "experiencia unica cara! nunca vi uma loja assim com esse jogo. ganhei frete gratis na roleta e
                      chegou super rapido. lego sempre inovando 👏"
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
