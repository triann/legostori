"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Trophy, Clock, Star, CheckCircle } from "lucide-react"

interface PuzzlePiece {
  id: number
  image: string
  correctPosition: number
  currentPosition: number
  isFlipped: boolean
  isSelected: boolean
}

export function PuzzleChallenge() {
  const [currentStep, setCurrentStep] = useState<"intro" | "countdown" | "reveal" | "shuffle" | "play" | "completed">(
    "intro",
  )
  const [countdown, setCountdown] = useState(5)
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [completedPuzzles, setCompletedPuzzles] = useState(0)
  const [selectedPieces, setSelectedPieces] = useState<number[]>([])
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)

  const puzzleImages = [
    "https://legobrasil.vtexassets.com/arquivos/ids/185202/10330--1-.jpg?v=638424970071170000",
    "https://legobrasil.vtexassets.com/arquivos/ids/176770/lego_40478_Disney_Mini_Castelo_da_Disney_01.jpg?v=637732735262400000",
    "https://legobrasil.vtexassets.com/arquivos/ids/189242/40817.jpg?v=638768033043630000",
    "https://legobrasil.vtexassets.com/arquivos/ids/189063/21272.jpg?v=638738549970430000",
    "https://legobrasil.vtexassets.com/arquivos/ids/187718/76934.jpg?v=638646997377600000",
    "https://legobrasil.vtexassets.com/arquivos/ids/188029/76443.jpg?v=638689283624800000",
    "https://legobrasil.vtexassets.com/arquivos/ids/170220/31058_prod.jpg?v=637111671490100000",
    "https://legobrasil.vtexassets.com/arquivos/ids/187552/21352.jpg?v=638621859108970000",
    "https://legobrasil.vtexassets.com/arquivos/ids/184072/60367-lego-city-aviao-de-passageiros.jpg?v=638276417925400000",
  ]

  useEffect(() => {
    if (currentStep === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (currentStep === "countdown" && countdown === 0) {
      setCurrentStep("reveal")
      initializePuzzle()
    }
  }, [currentStep, countdown])

  useEffect(() => {
    if (selectedPieces.length === 2) {
      const [first, second] = selectedPieces
      const newPieces = [...pieces]

      // Trocar posições das peças selecionadas
      const firstPiece = newPieces.find((p) => p.currentPosition === first)
      const secondPiece = newPieces.find((p) => p.currentPosition === second)

      if (firstPiece && secondPiece) {
        firstPiece.currentPosition = second
        secondPiece.currentPosition = first

        // Reorganizar array baseado nas novas posições
        newPieces.sort((a, b) => a.currentPosition - b.currentPosition)

        setPieces(newPieces.map((p) => ({ ...p, isSelected: false })))

        // Verificar se quebra-cabeça está completo
        const isComplete = newPieces.every((piece) => piece.correctPosition === piece.currentPosition)

        if (isComplete) {
          setTimeout(() => {
            if (completedPuzzles + 1 >= 5) {
              setCurrentStep("completed")
            } else {
              setCompletedPuzzles((prev) => prev + 1)
              setCurrentPuzzleIndex((prev) => prev + 1)
              startNextPuzzle()
            }
          }, 1000)
        }
      }

      setSelectedPieces([])
    }
  }, [selectedPieces, pieces, completedPuzzles])

  const initializePuzzle = () => {
    const initialPieces = puzzleImages.map((image, index) => ({
      id: index,
      image,
      correctPosition: index,
      currentPosition: index,
      isFlipped: false,
      isSelected: false,
    }))
    setPieces(initialPieces)

    setTimeout(() => {
      setPieces((prev) => prev.map((piece) => ({ ...piece, isFlipped: true })))
      setTimeout(() => {
        setCurrentStep("shuffle")
        shufflePieces()
      }, 1500)
    }, 2000)
  }

  const shufflePieces = () => {
    const shuffled = [...pieces]
    do {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
    } while (shuffled.some((piece, index) => piece.correctPosition === index))

    setPieces(shuffled.map((piece, index) => ({ ...piece, currentPosition: index })))

    setTimeout(() => {
      setCurrentStep("play")
    }, 2000)
  }

  const startNextPuzzle = () => {
    setCurrentStep("countdown")
    setCountdown(3)
  }

  const handlePieceClick = (position: number) => {
    if (selectedPieces.length < 2 && !selectedPieces.includes(position)) {
      setSelectedPieces((prev) => [...prev, position])
      setPieces((prev) =>
        prev.map((piece) => (piece.currentPosition === position ? { ...piece, isSelected: true } : piece)),
      )
    }
  }

  const goToWheel = () => {
    localStorage.setItem("puzzleCompleted", "true")
    localStorage.setItem("discountEarned", "80")
    localStorage.setItem("wheelSpins", "0") // Adicionando controle de rodadas da roleta
    window.location.href = "/wheel"
  }

  const startChallenge = () => {
    setCurrentStep("countdown")
    setCountdown(5)
  }

  if (currentStep === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('/dark-lego-background.png')] bg-cover bg-center bg-blend-overlay flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-6 sm:p-8 text-center animate-bounce-in bg-white/95 backdrop-blur-sm">
          <div className="mb-6">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Desafio LEGO Puzzle</h1>
            <p className="text-lg sm:text-xl text-gray-700">
              Complete 5 quebra-cabeças e ganhe até <span className="text-red-600 font-bold">80% OFF</span>
            </p>
          </div>

          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900">Como Funciona:</h2>
            <div className="space-y-3 text-left text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <span>Complete 5 quebra-cabeças únicos</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <span>Cada quebra-cabeça tem peças embaralhadas</span>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <span>Gire a roleta e ganhe até 80% de desconto</span>
              </div>
            </div>
          </div>

          <Button
            onClick={startChallenge}
            size="lg"
            className="w-full text-lg sm:text-xl px-6 py-3 sm:px-8 sm:py-4 bg-red-600 hover:bg-red-700 animate-pulse"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Começar Desafio
          </Button>
        </Card>
      </div>
    )
  }

  if (currentStep === "countdown") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('/dark-lego-background.png')] bg-cover bg-center bg-blend-overlay flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-white">Preparando seu quebra-cabeça...</h2>
          <div className="text-6xl sm:text-8xl font-bold text-red-500 animate-bounce">{countdown}</div>
        </div>
      </div>
    )
  }

  if (currentStep === "reveal") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('/dark-lego-background.png')] bg-cover bg-center bg-blend-overlay flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-white">Memorize as peças!</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
            {pieces.map((piece) => (
              <div
                key={piece.id}
                className={`w-20 h-20 sm:w-24 sm:h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center transition-all duration-1000 ${
                  piece.isFlipped ? "animate-bounce" : ""
                }`}
              >
                {piece.isFlipped ? (
                  <img
                    src={piece.image || "/placeholder.svg"}
                    alt={`Peça ${piece.id + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-lg">?</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "shuffle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('/dark-lego-background.png')] bg-cover bg-center bg-blend-overlay flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-white">Embaralhando peças...</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
            {pieces.map((piece) => (
              <div
                key={piece.id}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center animate-spin"
              >
                <img
                  src={piece.image || "/placeholder.svg"}
                  alt={`Peça ${piece.id + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('/dark-lego-background.png')] bg-cover bg-center bg-blend-overlay flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-6 sm:p-8 text-center animate-bounce-in bg-white/95 backdrop-blur-sm">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Parabéns!</h1>
          <p className="text-lg text-gray-700 mb-6">
            Você completou todos os 5 quebra-cabeças! Agora é hora de girar a roleta e conquistar seu desconto.
          </p>

          <Button
            onClick={goToWheel}
            size="lg"
            className="w-full text-xl px-8 py-4 bg-red-600 hover:bg-red-700 animate-pulse"
          >
            <Trophy className="w-6 h-6 mr-2" />
            Girar Roleta - 80% OFF
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('/dark-lego-background.png')] bg-cover bg-center bg-blend-overlay p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Quebra-cabeça {completedPuzzles + 1} de 5</h2>
          <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 mb-4">
            <div
              className="bg-red-600 h-2 sm:h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedPuzzles / 5) * 100}%` }}
            />
          </div>
          <p className="text-white text-sm mb-4">Clique em duas peças para trocá-las de posição</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xs sm:max-w-md mx-auto mb-8">
          {pieces.map((piece) => (
            <button
              key={`${piece.id}-${piece.currentPosition}`}
              onClick={() => handlePieceClick(piece.currentPosition)}
              className={`w-20 h-20 sm:w-24 sm:h-24 bg-white border-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                piece.isSelected ? "border-red-500 ring-2 ring-red-300" : "border-gray-300 hover:border-red-500"
              }`}
            >
              <img
                src={piece.image || "/placeholder.svg"}
                alt={`Peça ${piece.id + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>

        {selectedPieces.length > 0 && (
          <div className="text-center mb-4">
            <p className="text-white text-sm">
              {selectedPieces.length === 1 ? "Selecione outra peça para trocar" : "Trocando peças..."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
