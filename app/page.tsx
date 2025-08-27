"use client"

import type React from "react"
import { PuzzleGame } from "@/components/puzzle-game"
import { UTMCapture } from "@/components/utm-capture"
import { useAnalytics } from "@/hooks/use-analytics"
import { useState, useEffect } from "react"
import { Trophy, Star, ThumbsUp, Zap, Target, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function HomePage() {
  const analytics = useAnalytics()
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
      name: "Icons - McLaren MP4/4 e Ayrton Senna",
      price: 499.99,
    },
    {
      image: "https://legobrasil.vtexassets.com/arquivos/ids/188029/76443.jpg?v=638689283624800000",
      name: "Harry Potter™ - Passeio de moto de Hagrid™ e Harr",
      price: 479.99,
    },
    {
      image:
        "https://legobrasil.vtexassets.com/arquivos/ids/176770/lego_40478_Disney_Mini_Castelo_da_Disney_01.jpg?v=637732735262400000",
      name: "Disney - Mini Castelo da Disney",
      price: 329.99,
    },
  ]

  const loadingMessages = ["Preparando Quebra-Cabeça...", "Juntando peças...", "Você está preparado?"]
  const transitionMessages = [
    "Quebra-Cabeça montado perfeitamente...",
    "Escolhendo próximo Quebra-Cabeça...",
    "Embaralhando peças...",
  ]

  const handleStartPuzzle = () => {
    analytics.trackEvent("puzzle_start_clicked", {
      puzzle_type: "lego_challenge",
      total_puzzles: puzzles.length,
      time_limit: 300,
      page: "homepage",
      button_location: "main_cta",
      user_session_time: Date.now() - (window.performance?.timing?.navigationStart || Date.now()),
    })

    setShowLoading(true)
    setTimerActive(true)
    setTotalMoves(0)
    setTotalErrors(0)
    setCompletionTime(0)

    const loadingStartTime = Date.now()

    let messageIndex = 0
    setLoadingMessage(loadingMessages[0])

    const messageInterval = setInterval(() => {
      messageIndex++
      if (messageIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[messageIndex])

        analytics.trackEvent("puzzle_loading_step", {
          step: messageIndex,
          message: loadingMessages[messageIndex],
          loading_time: Date.now() - loadingStartTime,
        })
      } else {
        clearInterval(messageInterval)

        analytics.trackEvent("puzzle_loading_complete", {
          total_loading_time: Date.now() - loadingStartTime,
          ready_to_play: true,
        })

        setTimeout(() => {
          setShowLoading(false)
          setShowPuzzle(true)

          analytics.trackEvent("puzzle_game_started", {
            puzzle_number: currentPuzzle + 1,
            game_start_time: Date.now(),
          })
        }, 500)
      }
    }, 1500)
  }

  const handlePuzzleComplete = (
    result: { type: "discount" | "free"; value: number; productName?: string },
    moves: number,
    errors: number,
  ) => {
    analytics.trackEvent("puzzle_completed", {
      puzzle_number: currentPuzzle + 1,
      moves_count: moves || 0,
      errors_count: errors || 0,
      result_type: result.type,
      result_value: result.value,
      product_name: result.productName,
      time_taken: 300 - timeLeft,
      completion_efficiency: Math.max(0, 100 - (moves || 0) * 2 - (errors || 0) * 5),
      time_remaining: timeLeft,
    })

    setTotalMoves((prev) => prev + (moves || 0))
    setTotalErrors((prev) => prev + (errors || 0))
    setShowConfetti(true)

    setTimeout(() => {
      setShowConfetti(false)

      if (currentPuzzle < puzzles.length - 1) {
        analytics.trackEvent("puzzle_transition_started", {
          from_puzzle: currentPuzzle + 1,
          to_puzzle: currentPuzzle + 2,
          total_moves_so_far: totalMoves + (moves || 0),
          total_errors_so_far: totalErrors + (errors || 0),
        })

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

              analytics.trackEvent("next_puzzle_started", {
                puzzle_number: currentPuzzle + 2,
                previous_puzzle_performance: {
                  moves: moves || 0,
                  errors: errors || 0,
                  time_taken: 300 - timeLeft,
                },
              })
            }, 500)
          }
        }, 1000)
      } else {
        analytics.trackEvent("all_puzzles_completed", {
          total_completion_time: 300 - timeLeft,
          total_moves: totalMoves + (moves || 0),
          total_errors: totalErrors + (errors || 0),
          final_result: result,
          performance_rating: getPerformanceRating().rating,
        })

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
      analytics.trackEvent("cpf_confirmed", {
        cpf_length: cpf.replace(/\D/g, "").length,
        discount_earned: puzzleResult?.value || 80,
        discount_type: puzzleResult?.type || "discount",
        total_completion_time: completionTime,
        total_moves: totalMoves,
        total_errors: totalErrors,
        performance_rating: getPerformanceRating().rating,
        ready_for_roulette: true,
      })

      setShowPerformance(false)
      setShowCpfConfirmation(true)

      setTimeout(() => {
        analytics.trackEvent("redirecting_to_roulette", {
          user_cpf_provided: true,
          discount_earned: puzzleResult?.value || 80,
          total_journey_time: Date.now() - (window.performance?.timing?.navigationStart || Date.now()),
        })

        localStorage.setItem("puzzleCompleted", "true")
        localStorage.setItem("discountEarned", puzzleResult?.value.toString() || "80")
        localStorage.setItem("discountType", puzzleResult?.type || "discount")
        if (puzzleResult?.productName) {
          localStorage.setItem("freeProductName", puzzleResult.productName)
        }
        localStorage.setItem("userCpf", cpf)
        setShowCpfConfirmation(false)
        window.location.href = "/roulette"
      }, 3000)
    }
  }

  const handleClosePuzzle = () => {
    analytics.trackEvent("puzzle_abandoned", {
      puzzle_number: currentPuzzle + 1,
      time_spent: 300 - timeLeft,
      moves_made: totalMoves,
      errors_made: totalErrors,
      abandonment_reason: "user_closed",
      completion_percentage: Math.round(((300 - timeLeft) / 300) * 100),
    })

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

  const trackButtonClick = (buttonName: string, additionalProps?: Record<string, any>) => {
    analytics.trackClick(buttonName, additionalProps)
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
        <div className="max-w-sm w-full bg-white/95 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900">Parabéns!</h1>
            </div>
            <p className="text-sm text-gray-700">Você completou todos os quebra-cabeças!</p>
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
                <span className="font-semibold">3/3</span>
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
              Insira seu CPF para resgatar seu desconto. <strong>O resgate é único por CPF.</strong>
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
      <div className="max-w-sm w-full p-3 sm:p-4 text-center bg-white/95 backdrop-blur-sm rounded-lg transform transition-all duration-500 hover:scale-105 mt-26">
        <div className="mb-3">
          <p className="text-sm sm:text-base text-gray-700 mb-3">
            Complete <span className="text-red-600 font-bold">3 quebra-cabeças</span> de produtos LEGO aleatórios em até{" "}
            <span className="text-red-600 font-bold">5 minutos</span> e ganhe até{" "}
            <span className="text-red-600 font-bold">80% OFF</span>!
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Como Funciona:</h2>
          </div>
          <div className="space-y-2 text-left text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </span>
              <span>Monte 3 quebra-cabeças de produtos LEGO usando as imagens de referência;</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </span>
              <span>Clique nas peças para trocá-las de posição até formar a imagem correta;</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </span>
              <span>Você tem 5 minutos para completar os 3 quebra-cabeças;</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </span>
              <span>Gire a roleta da sorte e ganhe 80% de desconto na loja toda!</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            analytics.trackEvent("start_puzzle_button_clicked", {
              page: "homepage",
              challenge_type: "lego_puzzle",
              button_text: "Começar Desafio",
              user_scroll_position: window.scrollY,
              viewport_height: window.innerHeight,
              time_on_page: Date.now() - (window.performance?.timing?.navigationStart || Date.now()),
            })

            handleStartPuzzle()
          }}
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
