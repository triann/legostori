"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Gift, ArrowRight, Star } from "lucide-react"

interface WheelSegment {
  id: number
  discount: number
  color: string
  probability: number
  label: string
}

export function WheelSpinner() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [wheelSpins, setWheelSpins] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)

  useEffect(() => {
    const spins = Number.parseInt(localStorage.getItem("wheelSpins") || "0")
    setWheelSpins(spins)
    setCurrentRound(spins + 1)
  }, [])

  const firstRoundSegments: WheelSegment[] = [
    { id: 1, discount: 80, color: "#dc2626", probability: 1.0, label: "80% OFF" }, // 100% chance na primeira rodada
  ]

  const secondRoundSegments: WheelSegment[] = [
    { id: 1, discount: 100, color: "#16a34a", probability: 1.0, label: "GRÁTIS" }, // 100% chance na segunda rodada (produto grátis)
  ]

  const segments = currentRound === 1 ? firstRoundSegments : secondRoundSegments

  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setShowResult(false)

    const selectedSegment = segments[0] // Sempre o primeiro (e único) segmento

    // Calculate rotation to land on selected segment
    const segmentAngle = 360 / segments.length
    const targetAngle = (selectedSegment.id - 1) * segmentAngle
    const spins = 5 + Math.random() * 3 // 5-8 full rotations
    const finalRotation = rotation + spins * 360 + (360 - targetAngle)

    setRotation(finalRotation)
    setResult(selectedSegment.discount)

    setTimeout(() => {
      setIsSpinning(false)
      setShowResult(true)

      const newSpinCount = wheelSpins + 1
      localStorage.setItem("wheelSpins", newSpinCount.toString())

      if (currentRound === 1) {
        localStorage.setItem("firstDiscount", "80")
        localStorage.setItem("finalDiscount", "80")
      } else {
        localStorage.setItem("secondDiscount", "100")
        localStorage.setItem("finalDiscount", "100")
        localStorage.setItem("productFree", "true")
      }
    }, 4000)
  }

  const continueToNextRound = () => {
    setWheelSpins((prev) => prev + 1)
    setCurrentRound(2)
    setShowResult(false)
    setResult(null)
  }

  const goToStore = () => {
    window.location.href = "/store"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('/dark-lego-background.png')] bg-cover bg-center bg-blend-overlay flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 text-center bg-white/95 backdrop-blur-sm">
        {!showResult ? (
          <>
            <div className="mb-6">
              <Trophy className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {currentRound === 1 ? "Primeira Rodada!" : "Rodada Final!"}
              </h1>
              <p className="text-lg text-gray-700">
                {currentRound === 1
                  ? "Gire a roleta para descobrir seu primeiro desconto!"
                  : "Última chance! Gire novamente para uma surpresa especial!"}
              </p>

              <div className="flex justify-center gap-2 mt-4">
                <div className={`w-3 h-3 rounded-full ${currentRound >= 1 ? "bg-red-600" : "bg-gray-300"}`}></div>
                <div className={`w-3 h-3 rounded-full ${currentRound >= 2 ? "bg-red-600" : "bg-gray-300"}`}></div>
              </div>
            </div>

            <div className="relative mb-8">
              <div className="w-64 h-64 mx-auto relative">
                {/* Wheel */}
                <div
                  className="w-full h-full rounded-full border-4 border-gray-800 relative overflow-hidden transition-transform duration-4000 ease-out"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {segments.map((segment, index) => {
                    const angle = 360 / segments.length
                    const rotation = index * angle
                    return (
                      <div
                        key={segment.id}
                        className="absolute w-full h-full flex items-center justify-center"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          backgroundColor: segment.color,
                        }}
                      >
                        <div className="text-white font-bold text-xl transform -rotate-0">{segment.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-800"></div>
                </div>
              </div>
            </div>

            <Button
              onClick={spinWheel}
              disabled={isSpinning}
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xl py-4"
            >
              {isSpinning ? "Girando..." : `Girar Roleta - Rodada ${currentRound}`}
            </Button>
          </>
        ) : (
          <>
            <div className="mb-6">
              {currentRound === 1 ? (
                <Gift className="w-16 h-16 text-red-600 mx-auto mb-4 animate-bounce" />
              ) : (
                <Star className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentRound === 1 ? "Incrível!" : "FANTÁSTICO!"}
              </h1>

              <p className="text-xl text-gray-700 mb-4">
                {currentRound === 1 ? (
                  <>
                    Você ganhou <span className="text-red-600 font-bold text-2xl">80% OFF</span>
                  </>
                ) : (
                  <>
                    Você ganhou <span className="text-green-600 font-bold text-2xl">PRODUTO GRÁTIS!</span>
                  </>
                )}
              </p>

              <p className="text-gray-600">
                {currentRound === 1
                  ? "Mas espere! Você tem direito a mais uma rodada especial!"
                  : "Você paga apenas o frete! Aproveite nossa seleção exclusiva de produtos LEGO!"}
              </p>
            </div>

            {currentRound === 1 ? (
              <Button
                onClick={continueToNextRound}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xl py-4 animate-pulse"
              >
                <Star className="w-6 h-6 mr-2" />
                Girar Novamente - Rodada Final!
              </Button>
            ) : (
              <Button
                onClick={goToStore}
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xl py-4"
              >
                <ArrowRight className="w-6 h-6 mr-2" />
                Ir para Loja - PRODUTO GRÁTIS
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
