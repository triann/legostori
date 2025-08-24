"use client"

import type React from "react"
import { PuzzleGame } from "@/components/puzzle-game"
import { UTMCapture } from "@/components/utm-capture"
import { useState, useEffect } from "react"
import { Trophy, Star, ThumbsUp, Zap, Target, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function HomePage() {
  const [showPuzzle, setShowPuzzle] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [currentPuzzle, setCurrentPuzzle] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [transitionMessage, setTransitionMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos em segundos
  const [timerActive, setTimerActive] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showCpfConfirmation, setShowCpfConfirmation] = useState(false)
  const [cpf, setCpf] = useState("")
  const [totalMoves, setTotalMoves] = useState(0)
  const [totalErrors, setTotalErrors] = useState(0)
  const [completionTime, setCompletionTime] = useState(0)
  const [puzzleResult, setPuzzleResult] = useState<{
    type: "discount" | "free"
    value: number
    productName?: string
  } | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            window.location.href = "/"
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  const puzzles = [
    {
      image: "https://legobrasil.vtexassets.com/arquivos/ids/185202/10330--1-.jpg?v=638424970071170000",
      name: "LEGO Icons - McLaren MP4/4 e Ayrton Senna",
      price: 2499.99,
    },
    {
      image: "https://legobrasil.vtexassets.com/arquivos/ids/185202/10330--1-.jpg?v=638424970071170000",
      name: "LEGO Creator Expert - Taj Mahal",
      price: 1899.99,
    },
    {
      image: "https://legobrasil.vtexassets.com/arquivos/ids/185202/10330--1-.jpg?v=638424970071170000",
      name: "LEGO Architecture - Estátua da Liberdade",
      price: 1299.99,
    },
    {
      image: "https://legobrasil.vtexassets.com/arquivos/ids/185202/10330--1-.jpg?v=638424970071170000",
      name: "LEGO Technic - Lamborghini Sián",
      price: 3499.99,
    },
    {
      image: "https://legobrasil.vtexassets.com/arquivos/ids/185202/10330--1-.jpg?v=638424970071170000",
      name: "LEGO Creator - Casa Gingerbread",
      price: 999.99,
    },
  ]

  const loadingMessages = ["Preparando Quebra-Cabeça...", "Juntando peças...", "Você está preparado?"]
  const transitionMessages = [
    "Quebra-Cabeça montado perfeitamente...",
    "Escolhendo próximo Quebra-Cabeça...",
    "Embaralhando peças...",
  ]

  const handleStartPuzzle = () => {
    setShowLoading(true)
    setTimerActive(true)
    setTotalMoves(0)
    setTotalErrors(0)
    setCompletionTime(0)

    let messageIndex = 0
    setLoadingMessage(loadingMessages[0])

    const messageInterval = setInterval(() => {
      messageIndex++
      if (messageIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[messageIndex])
      } else {
        clearInterval(messageInterval)
        setTimeout(() => {
          setShowLoading(false)
          setShowPuzzle(true)
        }, 500)
      }
    }, 1500)
  }

  const handlePuzzleComplete = (
    result: { type: "discount" | "free"; value: number; productName?: string },
    moves: number,
    errors: number,
  ) => {
    setTotalMoves((prev) => prev + (moves || 0))
    setTotalErrors((prev) => prev + (errors || 0))
    setShowConfetti(true)

    setTimeout(() => {
      setShowConfetti(false)

      if (currentPuzzle < puzzles.length - 1) {
        setShowTransition(true)
        let messageIndex = 0
        setTransitionMessage(transitionMessages[0])

        const messageInterval = setInterval(() => {
          messageIndex++
          if (messageIndex < transitionMessages.length) {
            setTransitionMessage(transitionMessages[messageIndex])
          } else {
            clearInterval(messageInterval)
            setTimeout(() => {
              setShowTransition(false)
              setCurrentPuzzle(currentPuzzle + 1)
            }, 500)
          }
        }, 1000) // 1 segundo cada mensagem
      } else {
        setTimerActive(false)
        setCompletionTime(300 - timeLeft)
        setPuzzleResult(result)
        setShowPuzzle(false)
        setShowPerformance(true)
      }
    }, 2000)
  }

  const handleCpfConfirm = () => {
    if (cpf.length >= 11) {
      setShowPerformance(false)
      setShowCpfConfirmation(true)

      setTimeout(() => {
        localStorage.setItem("puzzleCompleted", "true")
        localStorage.setItem("discountEarned", puzzleResult?.value.toString() || "80")
        localStorage.setItem("discountType", puzzleResult?.type || "discount")
        if (puzzleResult?.productName) {
          localStorage.setItem("freeProductName", puzzleResult.productName)
        }
        localStorage.setItem("userCpf", cpf)
        setShowCpfConfirmation(false)
        window.location.href = "/roulette" // Assuming you have a roulette page
      }, 3000)
    }
  }

  const handleClosePuzzle = () => {
    setTimerActive(false)
    setShowPuzzle(false)
    setCurrentPuzzle(0)
    setTimeLeft(300)
  }

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    setCpf(formatted)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPerformanceRating = () => {
    const timeScore = completionTime <= 180 ? 100 : Math.max(0, 100 - (completionTime - 180) * 2)
    const errorScore = Math.max(0, 100 - totalErrors * 10)
    const moveScore = totalMoves <= 50 ? 100 : Math.max(0, 100 - (totalMoves - 50) * 2)
    const average = (timeScore + errorScore + moveScore) / 3

    if (average >= 90) return { rating: "EXCELENTE", color: "text-green-500", icon: Trophy }
    if (average >= 70) return { rating: "MUITO BOM", color: "text-blue-500", icon: Star }
    if (average >= 50) return { rating: "BOM", color: "text-yellow-500", icon: ThumbsUp }
    return { rating: "PODE MELHORAR", color: "text-orange-500", icon: Zap }
  }

  const getRandomRanking = () => {
    return Math.floor(Math.random() * 1000) + 1
  }

  if (showCpfConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('https://i.ibb.co/5Xhm2BC8/bg.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay flex items-center justify-center p-3">
        <UTMCapture />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 animate-pulse">Confirmando CPF...</h2>
          <p className="text-base text-white/80 mb-3">Preparando sua roleta da sorte</p>
          <div className="flex justify-center space-x-2 mt-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                style={{ animationDelay: `${index * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showPerformance) {
    const performance = getPerformanceRating()
    const IconComponent = performance.icon
    const ranking = getRandomRanking()

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('https://i.ibb.co/5Xhm2BC8/bg.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay flex items-center justify-center p-3">
        <UTMCapture />
        <div className="max-w-xs w-full bg-white/95 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="mb-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h1 className="text-xl font-bold text-gray-900">Parabéns!</h1>
            </div>
            <p className="text-base text-gray-700">Você completou todos os 5 quebra-cabeças!</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Sua Performance</h2>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Tempo Total:</span>
                </div>
                <span className="font-semibold">{formatTime(completionTime)}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Total de Movimentos:</span>
                </div>
                <span className="font-semibold">{totalMoves}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Quebra-cabeças Completos:</span>
                </div>
                <span className="font-semibold">5/5</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Classificação:</span>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${performance.color} flex items-center gap-1`}>
                    <IconComponent className="w-4 h-4" />
                    {performance.rating}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-red-600" />
              <h3 className="text-base font-semibold text-red-800">Resgate seu Prêmio</h3>
            </div>
            <p className="text-xs text-red-700 mb-3">
              Insira seu CPF para resgatar seu desconto. Cada CPF pode resgatar apenas uma vez.
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
                  Confirmar CPF
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

  if (showTransition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('https://i.ibb.co/5Xhm2BC8/bg.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay flex items-center justify-center p-3">
        <UTMCapture />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 animate-pulse">{transitionMessage}</h2>
          <div className="flex justify-center space-x-2 mt-3">
            {transitionMessages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  transitionMessages.indexOf(transitionMessage) >= index ? "bg-red-600" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('https://i.ibb.co/5Xhm2BC8/bg.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay flex items-center justify-center p-3">
        <UTMCapture />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 animate-pulse">{loadingMessage}</h2>
          <div className="flex justify-center space-x-2 mt-3">
            {loadingMessages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  loadingMessages.indexOf(loadingMessage) >= index ? "bg-red-600" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showPuzzle) {
    const currentPuzzleData = puzzles[currentPuzzle]
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('https://i.ibb.co/5Xhm2BC8/bg.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay relative">
        <UTMCapture />

        {showConfetti && (
          <div className="fixed inset-0 z-40 pointer-events-none">
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"][
                      Math.floor(Math.random() * 5)
                    ],
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end pb-8 justify-center min-h-screen p-1">
          <PuzzleGame
            image={currentPuzzleData.image}
            onComplete={handlePuzzleComplete}
            onClose={handleClosePuzzle}
            productName={currentPuzzleData.name}
            discount={80}
            originalPrice={currentPuzzleData.price}
            discountedPrice={currentPuzzleData.price * 0.2}
            timeLimit={timeLeft}
            currentPuzzle={currentPuzzle + 1}
            totalPuzzles={puzzles.length}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-[url('https://i.ibb.co/5Xhm2BC8/bg.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay flex items-center justify-center p-3">
      <UTMCapture />
      <div className="max-w-sm w-full p-4 sm:p-6 text-center bg-white/95 backdrop-blur-sm rounded-lg transform transition-all duration-500 hover:scale-105 mt-26">
        <div className="mb-3">
          <p className="text-sm sm:text-base text-gray-700 mb-3">
            Complete <span className="text-red-600 font-bold">5 quebra-cabeças</span> de produtos LEGO aleatórios em até{" "}
            <span className="text-red-600 font-bold">5 minutos</span> e ganhe até{" "}
            <span className="text-red-600 font-bold">80% OFF</span>!
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Como Funciona:</h2>
          </div>
          <div className="space-y-2 text-left text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </span>
              <span>Monte 5 quebra-cabeças de produtos LEGO usando as imagens de referência</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </span>
              <span>Clique nas peças para trocá-las de posição até formar a imagem correta</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </span>
              <span>Você tem apenas 5 minutos para completar todos os 5 quebra-cabeças</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </span>
              <span>Gire a roleta da sorte e ganhe descontos incríveis!</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartPuzzle}
          className="w-full text-base px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all hover:scale-105 animate-pulse shadow-lg flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Começar Desafio
        </button>

        <p className="text-xs text-gray-600 mt-2 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Oferta limitada - Resgate único por CPF!
        </p>
      </div>
    </div>
  )
}
