"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface FunnelMetrics {
  homePageView: number
  productPageView: number
  puzzleViewed: number
  puzzleStarted: number
  puzzleFinished: number
  cpfInserted: number
  addedToCart: number
  checkoutViewed: number
  checkoutPersonalInfo: number
  checkoutDelivery: number
  checkoutPayment: number
  roulettePageView: number
  rouletteTermsAccepted: number
  rouletteFirstSpin: number
  rouletteDecision80: number
  rouletteRiskAll: number
  rouletteResult100: number
}

interface AnalyticsChartProps {
  data: FunnelMetrics
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
      step: "Visualizou Quebra-cabeça",
      count: data.puzzleViewed,
      rate: data.productPageView ? (data.puzzleViewed / data.productPageView) * 100 : 0,
    },
    {
      step: "Iniciou Quebra-cabeça",
      count: data.puzzleStarted,
      rate: data.puzzleViewed ? (data.puzzleStarted / data.puzzleViewed) * 100 : 0,
    },
    {
      step: "Finalizou Quebra-cabeça",
      count: data.puzzleFinished,
      rate: data.puzzleStarted ? (data.puzzleFinished / data.puzzleStarted) * 100 : 0,
    },
    {
      step: "Inseriu CPF",
      count: data.cpfInserted,
      rate: data.puzzleFinished ? (data.cpfInserted / data.puzzleFinished) * 100 : 0,
    },
    {
      step: "Visualizou Roleta",
      count: data.roulettePageView,
      rate: data.cpfInserted ? (data.roulettePageView / data.cpfInserted) * 100 : 0,
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
      step: "Resgatou 80%",
      count: data.rouletteDecision80,
      rate: data.rouletteFirstSpin ? (data.rouletteDecision80 / data.rouletteFirstSpin) * 100 : 0,
    },
    {
      step: "Arriscou Tudo",
      count: data.rouletteRiskAll,
      rate: data.rouletteFirstSpin ? (data.rouletteRiskAll / data.rouletteFirstSpin) * 100 : 0,
    },
    {
      step: "Resgatou 100%",
      count: data.rouletteResult100,
      rate: data.rouletteRiskAll ? (data.rouletteResult100 / data.rouletteRiskAll) * 100 : 0,
    },
    {
      step: "Adicionou à Sacola",
      count: data.addedToCart,
      rate:
        data.rouletteDecision80 + data.rouletteResult100
          ? (data.addedToCart / (data.rouletteDecision80 + data.rouletteResult100)) * 100
          : 0,
    },
    {
      step: "Visualizou Checkout",
      count: data.checkoutViewed,
      rate: data.addedToCart ? (data.checkoutViewed / data.addedToCart) * 100 : 0,
    },
    {
      step: "Dados Pessoais",
      count: data.checkoutPersonalInfo,
      rate: data.checkoutViewed ? (data.checkoutPersonalInfo / data.checkoutViewed) * 100 : 0,
    },
    {
      step: "Entrega",
      count: data.checkoutDelivery,
      rate: data.checkoutPersonalInfo ? (data.checkoutDelivery / data.checkoutPersonalInfo) * 100 : 0,
    },
    {
      step: "Pagamento",
      count: data.checkoutPayment,
      rate: data.checkoutDelivery ? (data.checkoutPayment / data.checkoutDelivery) * 100 : 0,
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
        className="h-[600px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="step" angle={-45} textAnchor="end" height={120} fontSize={10} interval={0} />
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
        {chartData.map((item, index) => (
          <div key={item.step} className="flex flex-col p-2 border rounded">
            <span className="font-medium truncate">{item.step}</span>
            <span className="font-bold text-blue-600">
              {item.count} ({item.rate.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
