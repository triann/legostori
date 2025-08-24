"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Clock, Zap, Gift, Target, RotateCcw } from "lucide-react"

interface PuzzlePiece {
  id: number
  correctPosition: number
  currentPosition: number
  row: number
  col: number
}

interface RouletteOption {
  id: number
  label: string
  discount: number
  color: string
  textColor: string
}

interface PuzzleGameProps {
  image: string
  timeLimit: number // in seconds
  onComplete: (
    result: { type: "discount" | "free"; value: number; productName?: string },
    moves: number,
    errors: number,
  ) => void
  onClose: () => void
  productName: string
  discount: number
  originalPrice: number
  discountedPrice: number
  currentPuzzle: number // Adicionado prop para número do quebra-cabeça atual
  totalPuzzles: number // Adicionado prop para total de quebra-cabeças
}

export function PuzzleGame({
  image,
  timeLimit,
  onComplete,
  onClose,
  productName,
  discount,
  originalPrice,
  discountedPrice,
  currentPuzzle = 1, // Valor padrão
  totalPuzzles = 1, // Valor padrão
}: PuzzleGameProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [croppedImageData, setCroppedImageData] = useState<{
    dataUrl: string
    cropX: number
    cropY: number
    cropWidth: number
    cropHeight: number
  } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animatingPieces, setAnimatingPieces] = useState<Set<number>>(new Set())
  const [errorPieces, setErrorPieces] = useState<Set<number>>(new Set())
  const [showRoulette, setShowRoulette] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [finalPrize, setFinalPrize] = useState<RouletteOption | null>(null)
  const [spinRotation, setSpinRotation] = useState(0)
  const [currentSpin, setCurrentSpin] = useState<1 | 2>(1) // Primeira ou segunda rodada
  const [showSecondChance, setShowSecondChance] = useState(false) // Mostrar opção de segunda chance

  const timerRef = useRef<NodeJS.Timeout>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const rouletteOptions: RouletteOption[] = [
    { id: 1, label: "30% OFF", discount: 30, color: "#FFE4E1", textColor: "#8B0000" },
    { id: 2, label: "PRODUTO GRÁTIS", discount: 100, color: "#FFD700", textColor: "#B8860B" },
    { id: 3, label: "50% OFF", discount: 50, color: "#E6F3FF", textColor: "#0066CC" },
    { id: 4, label: "70% OFF", discount: 70, color: "#E8F5E8", textColor: "#006400" },
    { id: 5, label: "FRETE GRÁTIS", discount: 0, color: "#F3E8FF", textColor: "#7C3AED" },
    { id: 6, label: "15% OFF", discount: 15, color: "#FEF3C7", textColor: "#D97706" },
  ]

  const detectProductArea = (
    img: HTMLImageElement,
  ): Promise<{
    dataUrl: string
    cropX: number
    cropY: number
    cropWidth: number
    cropHeight: number
  }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      resolve({
        dataUrl: canvas.toDataURL(),
        cropX: 0,
        cropY: 0,
        cropWidth: img.width,
        cropHeight: img.height,
      })
    })
  }

  useEffect(() => {
    if (image) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = async () => {
        const cropData = await detectProductArea(img)
        setCroppedImageData(cropData)
      }
      img.src = image
    }
  }, [image])

  useEffect(() => {
    if (!croppedImageData) return

    const initialPieces: PuzzlePiece[] = []
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3)
      const col = i % 3
      initialPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
        row,
        col,
      })
    }

    const shuffled = [...initialPieces]

    for (let shuffle = 0; shuffle < 3; shuffle++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffled[i].currentPosition
        shuffled[i].currentPosition = shuffled[j].currentPosition
        shuffled[j].currentPosition = temp
      }
    }

    for (let i = 0; i < shuffled.length; i++) {
      if (shuffled[i].currentPosition === shuffled[i].correctPosition) {
        let swapIndex = (i + 1) % shuffled.length
        while (shuffled[swapIndex].currentPosition === shuffled[swapIndex].correctPosition && swapIndex !== i) {
          swapIndex = (swapIndex + 1) % shuffled.length
        }

        const temp = shuffled[i].currentPosition
        shuffled[i].currentPosition = shuffled[swapIndex].currentPosition
        shuffled[swapIndex].currentPosition = temp
      }
    }

    setPieces(shuffled)
  }, [croppedImageData])

  useEffect(() => {
    if (timeRemaining > 0 && !isComplete) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && !isComplete) {
      alert("Tempo esgotado! Tente novamente para ganhar seu desconto.")
      onClose()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, isComplete, onClose])

  useEffect(() => {
    const isCompleted = pieces.every((piece) => piece.correctPosition === piece.currentPosition)
    if (isCompleted && pieces.length > 0 && !isComplete) {
      setIsComplete(true)
      setShowConfetti(true)
      createConfetti()
      window.scrollTo(0, 0)

      setTimeout(() => {
        onComplete({ type: "discount", value: 70 }, moves, 0)
      }, 2000)
    }
  }, [pieces, isComplete, timeRemaining, onComplete, moves, currentPuzzle, totalPuzzles])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handlePieceClick = (pieceId: number) => {
    if (selectedPiece === null) {
      setSelectedPiece(pieceId)
    } else if (selectedPiece === pieceId) {
      setSelectedPiece(null)
    } else {
      setAnimatingPieces(new Set([selectedPiece, pieceId]))

      setTimeout(() => {
        const newPieces = [...pieces]
        const piece1Index = newPieces.findIndex((p) => p.id === selectedPiece)
        const piece2Index = newPieces.findIndex((p) => p.id === pieceId)

        const temp = newPieces[piece1Index].currentPosition
        newPieces[piece1Index].currentPosition = newPieces[piece2Index].currentPosition
        newPieces[piece2Index].currentPosition = temp

        const piece1Correct = newPieces[piece1Index].correctPosition === newPieces[piece1Index].currentPosition
        const piece2Correct = newPieces[piece2Index].correctPosition === newPieces[piece2Index].currentPosition

        if (!piece1Correct && !piece2Correct) {
          setErrorPieces(new Set([selectedPiece, pieceId]))
          setTimeout(() => {
            setErrorPieces(new Set())
          }, 600)
        }

        setPieces(newPieces)
        setSelectedPiece(null)
        setMoves((prev) => prev + 1)

        setTimeout(() => {
          setAnimatingPieces(new Set())
        }, 300)
      }, 150)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeColor = () => {
    if (timeRemaining > 60) return "text-green-600"
    if (timeRemaining > 30) return "text-yellow-600"
    return "text-red-600"
  }

  const createConfetti = () => {
    const confettiContainer = document.createElement("div")
    confettiContainer.style.position = "fixed"
    confettiContainer.style.top = "0"
    confettiContainer.style.left = "0"
    confettiContainer.style.width = "100%"
    confettiContainer.style.height = "100%"
    confettiContainer.style.pointerEvents = "none"
    confettiContainer.style.zIndex = "9999"
    document.body.appendChild(confettiContainer)

    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div")
      confetti.style.position = "absolute"
      confetti.style.width = "10px"
      confetti.style.height = "10px"
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = Math.random() * 100 + "%"
      confetti.style.top = "-10px"
      confetti.style.borderRadius = "50%"
      confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`
      confettiContainer.appendChild(confetti)
    }

    if (!document.getElementById("puzzle-animations")) {
      const style = document.createElement("style")
      style.id = "puzzle-animations"
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes piece-swap {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes piece-correct {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(34, 197, 94, 0);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(34, 197, 94, 0);
          }
        }
        
        @keyframes piece-error {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(239, 68, 68, 0);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `
      document.head.appendChild(style)
    }

    setTimeout(() => {
      document.body.removeChild(confettiContainer)
    }, 5000)
  }

  const spinRoulette = () => {
    if (isSpinning) return

    setIsSpinning(true)

    let selectedPrize: RouletteOption
    let targetIndex: number

    if (currentSpin === 1) {
      selectedPrize = { id: 99, label: "70% OFF", discount: 70, color: "#E8F5E8", textColor: "#006400" }
      targetIndex = 3 // 70% OFF está no index 3
    } else {
      selectedPrize = { id: 100, label: `${productName} GRÁTIS`, discount: 100, color: "#FFD700", textColor: "#B8860B" }
      targetIndex = 1 // PRODUTO GRÁTIS está no index 1
    }

    const degreesPerSection = 360 / 6 // 60 graus por seção
    const sectionStart = targetIndex * degreesPerSection
    const sectionEnd = sectionStart + degreesPerSection
    const suspenseOffset = degreesPerSection * 0.1 // Para a 10% do caminho da seção (quase no final)
    const targetAngle = sectionStart + suspenseOffset

    const targetRotation = 360 * 5 + (360 - targetAngle)

    setSpinRotation(targetRotation)

    setTimeout(() => {
      setIsSpinning(false)
      setFinalPrize(selectedPrize)

      if (currentSpin === 1) {
        setShowSecondChance(true)
      }
    }, 3000)
  }

  const trySecondSpin = () => {
    setCurrentSpin(2)
    setFinalPrize(null)
    setShowSecondChance(false)
    setSpinRotation(0)
  }

  const claimFirstPrize = () => {
    onComplete({ type: "discount", value: 70 }, moves, 0)
  }

  const handleClaimRoulettePrize = () => {
    if (finalPrize) {
      if (finalPrize.discount === 100) {
        onComplete({ type: "free", value: 100, productName: productName }, moves, 0)
      } else {
        onComplete({ type: "discount", value: finalPrize.discount }, moves, 0)
      }
    }
  }

  const getRoulettePrice = () => {
    if (!finalPrize) return originalPrice
    if (finalPrize.discount === 100) return 0
    return originalPrice * (1 - finalPrize.discount / 100)
  }

  const goToRoulette = () => {
    setShowRoulette(true)
    window.scrollTo(0, 0)
  }

  const renderRouletteWheel = () => {
    return (
      <div className="relative mx-auto w-48 h-48">
        <div
          className="w-full h-full transition-transform duration-3000 ease-out"
          style={{
            transform: `rotate(${spinRotation}deg)`,
            transitionDuration: isSpinning ? "3s" : "0s",
          }}
        >
          <svg width="192" height="192" viewBox="0 0 192 192" className="w-full h-full">
            {/* Seção 1: 30% OFF (0-60 graus) */}
            <path d="M 96 96 L 96 8 A 88 88 0 0 1 172.3 52 Z" fill="#FFE4E1" stroke="#333" strokeWidth="2" />
            <text
              x="136"
              y="40"
              textAnchor="middle"
              className="text-xs font-bold"
              fill="#8B0000"
              transform="rotate(30 136 40)"
            >
              <tspan x="136" dy="-3">
                30%
              </tspan>
              <tspan x="136" dy="12">
                OFF
              </tspan>
            </text>

            {/* Seção 2: PRODUTO GRÁTIS (60-120 graus) */}
            <path d="M 96 96 L 172.3 52 A 88 88 0 0 1 172.3 140 Z" fill="#FFD700" stroke="#333" strokeWidth="2" />
            <text
              x="160"
              y="96"
              textAnchor="middle"
              className="text-xs font-bold"
              fill="#B8860B"
              transform="rotate(90 160 96)"
            >
              <tspan x="160" dy="-3">
                PRODUTO
              </tspan>
              <tspan x="160" dy="12">
                GRÁTIS
              </tspan>
            </text>

            {/* Seção 3: 50% OFF (120-180 graus) */}
            <path d="M 96 96 L 172.3 140 A 88 88 0 0 1 96 184 Z" fill="#E6F3FF" stroke="#333" strokeWidth="2" />
            <text
              x="136"
              y="152"
              textAnchor="middle"
              className="text-xs font-bold"
              fill="#0066CC"
              transform="rotate(150 136 152)"
            >
              <tspan x="136" dy="-3">
                50%
              </tspan>
              <tspan x="136" dy="12">
                OFF
              </tspan>
            </text>

            {/* Seção 4: 70% OFF (180-240 graus) */}
            <path d="M 96 96 L 96 184 A 88 88 0 0 1 19.7 140 Z" fill="#E8F5E8" stroke="#333" strokeWidth="2" />
            <text
              x="56"
              y="152"
              textAnchor="middle"
              className="text-xs font-bold"
              fill="#006400"
              transform="rotate(210 56 152)"
            >
              <tspan x="56" dy="-3">
                70%
              </tspan>
              <tspan x="56" dy="12">
                OFF
              </tspan>
            </text>

            {/* Seção 5: FRETE GRÁTIS (240-300 graus) */}
            <path d="M 96 96 L 19.7 140 A 88 88 0 0 1 19.7 52 Z" fill="#F3E8FF" stroke="#333" strokeWidth="2" />
            <text
              x="32"
              y="96"
              textAnchor="middle"
              className="text-xs font-bold"
              fill="#7C3AED"
              transform="rotate(270 32 96)"
            >
              <tspan x="32" dy="-3">
                FRETE
              </tspan>
              <tspan x="32" dy="12">
                GRÁTIS
              </tspan>
            </text>

            {/* Seção 6: 15% OFF (300-360 graus) */}
            <path d="M 96 96 L 19.7 52 A 88 88 0 0 1 96 8 Z" fill="#FEF3C7" stroke="#333" strokeWidth="2" />
            <text
              x="56"
              y="40"
              textAnchor="middle"
              className="text-xs font-bold"
              fill="#D97706"
              transform="rotate(330 56 40)"
            >
              <tspan x="56" dy="-3">
                15%
              </tspan>
              <tspan x="56" dy="12">
                OFF
              </tspan>
            </text>

            {/* Centro da roleta */}
            <circle cx="96" cy="96" r="12" fill="#333" />
          </svg>
        </div>

        {/* Ponteiro da roleta */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-3 border-r-3 border-b-6 border-l-transparent border-r-transparent border-b-red-600"></div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-lg transform transition-all duration-500 hover:scale-105">
      <CardContent className="p-[1px] sm:p-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex-1 text-center">
            <h2 className="text-base md:text-xl font-bold text-gray-900">
              {showRoulette ? "Roleta da Sorte!" : `Desafio do Quebra-Cabeça ${currentPuzzle}/${totalPuzzles}`}
            </h2>
            <p className="text-xs md:text-sm text-gray-600">{productName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>

        {showRoulette ? (
          <div className="text-center space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 mb-3">
                Parabéns! Você completou o quebra-cabeça e agora tem direito à Roleta da Sorte!
              </p>

              {/* Informações sobre prêmios e chances */}
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-sm text-gray-800">{"Você pode receber:"}</span>
                </div>
                <div className="text-xs text-gray-700 space-y-1">
                  <p>• Descontos de 15% até 70%;</p>
                  <p>• Produto completamente Grátis;</p>
                  <p>• Frete completamente Grátis.</p>
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <RotateCcw className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold text-sm text-gray-800">Você tem 2 chances de girar!</span>
                </div>
              </div>
            </div>

            {renderRouletteWheel()}

            {!isSpinning && !finalPrize && (
              <div className="flex justify-center">
                <Button
                  onClick={spinRoulette}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 text-base rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  GIRAR ROLETA
                </Button>
              </div>
            )}

            {isSpinning && (
              <div className="text-center">
                <div className="animate-pulse text-lg font-semibold text-gray-700 flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  Girando... Boa sorte!
                </div>
              </div>
            )}

            {finalPrize && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gift className="w-6 h-6 text-green-600" />
                    <h3 className="text-2xl font-bold text-green-800">
                      Você ganhou: {finalPrize.discount === 100 ? finalPrize.label : finalPrize.label}!
                    </h3>
                  </div>
                  <p className="text-green-700">
                    {finalPrize.discount === 100
                      ? "Parabéns! O produto é seu de graça!"
                      : `Você ganhou ${finalPrize.discount}% de desconto!`}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Preço Original</p>
                      <p className="text-lg font-bold text-gray-500 line-through">
                        R$ {originalPrice.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div className="text-2xl">→</div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {finalPrize.discount === 100 ? "Seu Preço" : "Preço com Desconto"}
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        {finalPrize.discount === 100
                          ? "GRÁTIS!"
                          : `R$ ${getRoulettePrice().toFixed(2).replace(".", ",")}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-3">
                    {showSecondChance ? (
                      <>
                        <Button
                          onClick={claimFirstPrize}
                          className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
                        >
                          RESGATAR 70% DE DESCONTO
                        </Button>
                        <Button
                          onClick={trySecondSpin}
                          className="w-full max-w-md bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-5 h-5" />
                          TENTAR NOVAMENTE
                        </Button>
                        <p className="text-xs text-gray-600 text-center max-w-md">
                          Se escolher tentar novamente, você pode ganhar um prêmio ainda melhor ou perder este desconto
                        </p>
                      </>
                    ) : (
                      <Button
                        onClick={handleClaimRoulettePrize}
                        className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
                      >
                        RESGATAR AGORA
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-center justify-between mb-3 p-1 bg-gray-50 rounded-lg gap-2 md:gap-0">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${getTimeColor()}`} />
                  <span className={`font-bold text-sm ${getTimeColor()}`}>{formatTime(timeRemaining)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Movimentos:</span>
                  <span className="font-semibold text-xs">{moves}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-xs text-yellow-600">GIRE A ROLETA!</span>
              </div>
            </div>

            {!croppedImageData ? (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">Preparando quebra-cabeça...</p>
              </div>
            ) : (
              <>
                <div className="flex flex-row gap-3 items-start justify-center">
                  <div className="flex-shrink-0 text-center">
                    <h3 className="font-semibold mb-2 text-xs">Referência:</h3>
                    <img
                      src={croppedImageData.dataUrl || "/placeholder.svg"}
                      alt="Referência"
                      className="w-20 h-20 object-cover rounded border-2 border-gray-300 mx-auto"
                    />
                  </div>

                  <div className="flex-1 text-center">
                    <h3 className="font-semibold mb-2 text-xs">Resolva o quebra-cabeça:</h3>

                    <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
                      {Array.from({ length: 9 }, (_, position) => {
                        const piece = pieces.find((p) => p.currentPosition === position)
                        const pieceSize = 50
                        const totalSize = pieceSize * 3

                        const isCorrect = piece?.correctPosition === position
                        const isAnimating = piece && animatingPieces.has(piece.id)
                        const isError = piece && errorPieces.has(piece.id)

                        return (
                          <button
                            key={position}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-14 h-14 border-2 rounded overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                              selectedPiece === piece?.id
                                ? "border-blue-500 ring-2 ring-blue-200 scale-105"
                                : isCorrect
                                  ? "border-green-500 shadow-green-200"
                                  : isError
                                    ? "border-red-500 shadow-red-200"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{
                              animation: isAnimating
                                ? "piece-swap 0.3s ease-in-out"
                                : isCorrect
                                  ? "piece-correct 0.6s ease-in-out"
                                  : isError
                                    ? "piece-error 0.6s ease-in-out"
                                    : "none",
                            }}
                          >
                            {piece && (
                              <div
                                className="w-full h-full transition-transform duration-200 hover:scale-110"
                                style={{
                                  backgroundImage: `url(${croppedImageData.dataUrl})`,
                                  backgroundSize: `${totalSize}px ${totalSize}px`,
                                  backgroundPosition: `-${piece.col * pieceSize}px -${piece.row * pieceSize}px`,
                                  backgroundRepeat: "no-repeat",
                                }}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                      Clique em duas peças para trocá-las. Bordas verdes indicam posicionamento correto.
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
