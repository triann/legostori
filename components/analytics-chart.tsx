"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface FunnelStats {
  homePageView: number
  productPageView: number
  roulettePageView: number
  rouletteTermsAccepted: number
  rouletteFirstSpin: number
  rouletteDecision80OrRisk: number
  rouletteFinalResult: number
}

interface AnalyticsChartProps {
  data: FunnelStats
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const chartData = [
    { step: "Página Inicial", count: data.homePageView, rate: 100 },
    {
      step: "Página Produto",
      count: data.productPageView,
      rate: data.homePageView ? (data.productPageView / data.homePageView) * 100 : 0,
    },
    {
      step: "Visualizou Roleta",
      count: data.roulettePageView,
      rate: data.productPageView ? (data.roulettePageView / data.productPageView) * 100 : 0,
    },
    {
      step: "Aceitou Termos",
      count: data.rouletteTermsAccepted,
      rate: data.roulettePageView ? (data.rouletteTermsAccepted / data.roulettePageView) * 100 : 0,
    },
    {
      step: "Primeiro Giro",
      count: data.rouletteFirstSpin,
      rate: data.rouletteTermsAccepted ? (data.rouletteFirstSpin / data.rouletteTermsAccepted) * 100 : 0,
    },
    {
      step: "80% ou Risco",
      count: data.rouletteDecision80OrRisk,
      rate: data.rouletteFirstSpin ? (data.rouletteDecision80OrRisk / data.rouletteFirstSpin) * 100 : 0,
    },
    {
      step: "Resultado Final",
      count: data.rouletteFinalResult,
      rate: data.rouletteDecision80OrRisk ? (data.rouletteFinalResult / data.rouletteDecision80OrRisk) * 100 : 0,
    },
  ]

  return (
    <div className="space-y-4">
      <ChartContainer
        config={{
          count: {
            label: "Usuários",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-[400px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="step" angle={-45} textAnchor="end" height={100} fontSize={12} />
            <YAxis />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name, props) => [
                `${value} usuários (${props.payload?.rate?.toFixed(1)}%)`,
                "Conversão",
              ]}
            />
            <Bar dataKey="count" fill="var(--color-count)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="grid grid-cols-3 gap-4 text-sm">
        {chartData.map((item, index) => (
          <div key={item.step} className="flex justify-between p-2 border rounded">
            <span>{item.step}:</span>
            <span className="font-bold">
              {item.count} ({item.rate.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
