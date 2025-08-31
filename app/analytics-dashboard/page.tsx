"use client"

import { useState, useEffect } from "react"
import { AnalyticsChart } from "@/components/analytics-chart"
import { Download, RefreshCw, Calendar, Target, Home, Package, Dice6, CheckCircle, RotateCcw, Gift } from "lucide-react"

interface AnalyticsData {
  timestamp: string
  platform: string
  eventName: string
  data: any
  status: string
  error?: string
  userAgent: string
  url: string
  event_name?: string
}

interface FunnelMetrics {
  homePageView: number
  productPageView: number
  roulettePageView: number
  rouletteTermsAccepted: number
  rouletteFirstSpin: number
  rouletteDecision80OrRisk: number
  rouletteFinalResult: number
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const [funnelMetrics, setFunnelMetrics] = useState<FunnelMetrics>({
    homePageView: 0,
    productPageView: 0,
    roulettePageView: 0,
    rouletteTermsAccepted: 0,
    rouletteFirstSpin: 0,
    rouletteDecision80OrRisk: 0,
    rouletteFinalResult: 0,
  })

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tracking-log?date=${selectedDate}`)
      if (response.ok) {
        const logs = await response.json()
        console.log("[v0] Logs recebidos:", logs)
        console.log("[v0] Primeiro log:", logs[0])
        setData(logs)
        calculateFunnelMetrics(logs)
      }
    } catch (error) {
      console.error("Erro ao buscar analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateFunnelMetrics = (logs: AnalyticsData[]) => {
    const metrics: FunnelMetrics = {
      homePageView: 0,
      productPageView: 0,
      roulettePageView: 0,
      rouletteTermsAccepted: 0,
      rouletteFirstSpin: 0,
      rouletteDecision80OrRisk: 0,
      rouletteFinalResult: 0,
    }

    console.log("[v0] Calculando métricas para", logs.length, "logs")

    const eventCounts: Record<string, number> = {}
    const statusCounts: Record<string, number> = {}

    logs.forEach((log, index) => {
      const eventName = log.eventName || log.event_name || "UNDEFINED"
      const status = log.status || "UNDEFINED"

      eventCounts[eventName] = (eventCounts[eventName] || 0) + 1
      statusCounts[status] = (statusCounts[status] || 0) + 1

      if (index < 10) {
        console.log(`[v0] Log ${index}:`, {
          eventName: log.eventName,
          event_name: log.event_name,
          finalEventName: eventName,
          status: log.status,
          platform: log.platform,
          data: log.data,
        })
      }

      if (log.status === "success") {
        // Identificar page_view por URL específica
        if (eventName === "PageView" || eventName === "page_view") {
          const url = log.data?.url || log.url || ""
          if (url.includes("/product/") || url.includes("product")) {
            metrics.productPageView++
          } else if (url.includes("/roulette") || url.includes("roulette")) {
            metrics.roulettePageView++
          } else if (url === "/" || url.includes("home") || !url.includes("/")) {
            metrics.homePageView++
          }
        }

        // Eventos específicos da roleta
        switch (eventName) {
          case "RouletteTermsAccepted":
          case "roulette_terms_accepted":
            metrics.rouletteTermsAccepted++
            break
          case "RouletteFirstSpin":
          case "roulette_first_spin":
          case "RouletteStarted":
          case "roulette_started":
            metrics.rouletteFirstSpin++
            break
          case "RouletteDecision80":
          case "roulette_decision_80":
          case "RouletteRiskAll":
          case "roulette_risk_all":
            metrics.rouletteDecision80OrRisk++
            break
          case "DiscountClaimed":
          case "discount_claimed":
          case "discount_applied":
          case "RouletteResult80":
          case "RouletteResult100":
          case "roulette_result_80":
          case "roulette_result_100":
            metrics.rouletteFinalResult++
            break
          default:
            if (!["PageView", "page_view"].includes(eventName)) {
              console.log("[v0] Evento não reconhecido:", eventName, "Status:", status)
            }
        }
      } else {
        console.log("[v0] Evento ignorado por status:", eventName, "Status:", status)
      }
    })

    console.log("[v0] Contagem de todos os eventos:", eventCounts)
    console.log("[v0] Contagem de status:", statusCounts)
    console.log("[v0] Métricas calculadas:", metrics)
    setFunnelMetrics(metrics)
  }

  const downloadLogs = async () => {
    try {
      const response = await fetch(`/api/analytics-export?date=${selectedDate}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-${selectedDate}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Erro ao baixar logs:", error)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedDate])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics()
    }, 30000) // Atualiza a cada 30 segundos

    return () => clearInterval(interval)
  }, [selectedDate])

  const conversionRate = (from: number, to: number) => {
    return from > 0 ? ((to / from) * 100).toFixed(1) : "0.0"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Acompanhe o desempenho do funil de conversão detalhado</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>

          <button
            onClick={downloadLogs}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Baixar Logs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Página Inicial</p>
                <p className="text-2xl font-bold text-gray-900">{funnelMetrics.homePageView}</p>
              </div>
              <Home className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Página Produto</p>
                <p className="text-2xl font-bold text-gray-900">{funnelMetrics.productPageView}</p>
                <p className="text-xs text-gray-500">
                  {conversionRate(funnelMetrics.homePageView, funnelMetrics.productPageView)}%
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizou Roleta</p>
                <p className="text-2xl font-bold text-gray-900">{funnelMetrics.roulettePageView}</p>
                <p className="text-xs text-gray-500">
                  {conversionRate(funnelMetrics.productPageView, funnelMetrics.roulettePageView)}%
                </p>
              </div>
              <Dice6 className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aceitou Termos</p>
                <p className="text-2xl font-bold text-gray-900">{funnelMetrics.rouletteTermsAccepted}</p>
                <p className="text-xs text-gray-500">
                  {conversionRate(funnelMetrics.roulettePageView, funnelMetrics.rouletteTermsAccepted)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Primeiro Giro</p>
                <p className="text-2xl font-bold text-gray-900">{funnelMetrics.rouletteFirstSpin}</p>
                <p className="text-xs text-gray-500">
                  {conversionRate(funnelMetrics.rouletteTermsAccepted, funnelMetrics.rouletteFirstSpin)}%
                </p>
              </div>
              <RotateCcw className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">80% ou Risco</p>
                <p className="text-2xl font-bold text-gray-900">{funnelMetrics.rouletteDecision80OrRisk}</p>
                <p className="text-xs text-gray-500">
                  {conversionRate(funnelMetrics.rouletteFirstSpin, funnelMetrics.rouletteDecision80OrRisk)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resultado Final</p>
                <p className="text-2xl font-bold text-gray-900">{funnelMetrics.rouletteFinalResult}</p>
                <p className="text-xs text-gray-500">
                  {conversionRate(funnelMetrics.homePageView, funnelMetrics.rouletteFinalResult)}% total
                </p>
              </div>
              <Gift className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Gráfico do Funil */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Funil de Conversão Detalhado</h2>
          <AnalyticsChart data={funnelMetrics} />
        </div>

        {/* Logs Detalhados */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Logs Detalhados</h2>
            <p className="text-sm text-gray-600">Total de eventos: {data.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plataforma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dados
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 100).map((log, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          log.platform === "meta"
                            ? "bg-blue-100 text-blue-800"
                            : log.platform === "utmify"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {log.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.eventName || log.event_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : log.status === "error"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{JSON.stringify(log.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
