"use client"

import { useMemo } from "react"

interface FunnelMetrics {
  pageViews: number
  puzzleStarted: number
  puzzleCompleted: number
  cpfEntered: number
  rouletteStarted: number
  discountClaimed: number
  viewContent: number
  addToCart: number
  initiateCheckout: number
  purchase: number
}

interface AnalyticsChartProps {
  data: FunnelMetrics
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const funnelData = useMemo(() => {
    const steps = [
      { name: "Page Views", value: data.pageViews, color: "bg-blue-500" },
      { name: "Puzzle Iniciado", value: data.puzzleStarted, color: "bg-orange-500" },
      { name: "Puzzle Completo", value: data.puzzleCompleted, color: "bg-green-500" },
      { name: "CPF Inserido", value: data.cpfEntered, color: "bg-purple-500" },
      { name: "Roleta Iniciada", value: data.rouletteStarted, color: "bg-pink-500" },
      { name: "Desconto Resgatado", value: data.discountClaimed, color: "bg-indigo-500" },
      { name: "Visualizou Produtos", value: data.viewContent, color: "bg-yellow-500" },
      { name: "Adicionou ao Carrinho", value: data.addToCart, color: "bg-red-500" },
      { name: "Iniciou Checkout", value: data.initiateCheckout, color: "bg-teal-500" },
      { name: "Comprou", value: data.purchase, color: "bg-gray-800" },
    ]

    const maxValue = Math.max(...steps.map((step) => step.value))

    return steps.map((step) => ({
      ...step,
      percentage: maxValue > 0 ? (step.value / maxValue) * 100 : 0,
      conversionRate: data.pageViews > 0 ? ((step.value / data.pageViews) * 100).toFixed(1) : "0.0",
    }))
  }, [data])

  return (
    <div className="space-y-4">
      {funnelData.map((step, index) => (
        <div key={step.name} className="flex items-center space-x-4">
          <div className="w-32 text-sm font-medium text-gray-700 text-right">{step.name}</div>

          <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
            <div
              className={`h-full ${step.color} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
              style={{ width: `${step.percentage}%` }}
            >
              <span className="text-white text-sm font-bold">{step.value}</span>
            </div>
          </div>

          <div className="w-16 text-sm text-gray-600 text-center">{step.conversionRate}%</div>

          {index > 0 && (
            <div className="w-20 text-xs text-gray-500 text-center">
              {funnelData[index - 1].value > 0 ? ((step.value / funnelData[index - 1].value) * 100).toFixed(1) : "0.0"}%
              do anterior
            </div>
          )}
        </div>
      ))}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumo de Conversão</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Taxa de Engajamento:</span>
            <div className="font-bold text-orange-600">
              {data.pageViews > 0 ? ((data.puzzleStarted / data.pageViews) * 100).toFixed(1) : "0.0"}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Taxa de Conclusão:</span>
            <div className="font-bold text-green-600">
              {data.puzzleStarted > 0 ? ((data.puzzleCompleted / data.puzzleStarted) * 100).toFixed(1) : "0.0"}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Taxa de Resgate:</span>
            <div className="font-bold text-purple-600">
              {data.cpfEntered > 0 ? ((data.discountClaimed / data.cpfEntered) * 100).toFixed(1) : "0.0"}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Taxa de Compra:</span>
            <div className="font-bold text-red-600">
              {data.pageViews > 0 ? ((data.purchase / data.pageViews) * 100).toFixed(1) : "0.0"}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
