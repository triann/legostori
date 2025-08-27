"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  MousePointer,
  TrendingUp,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Download,
  Eye,
  ShoppingCart,
  CreditCard,
} from "lucide-react"

interface AnalyticsStats {
  total_events: number
  total_sessions: number
  total_users: number
  events_24h: number
  events_7d: number
  sessions_24h: number
  sessions_7d: number
  top_events: Array<{ event: string; count: number }>
  top_pages: Array<{ page: string; count: number }>
  top_utm_sources: Array<{ source: string; count: number }>
  device_breakdown: Array<{ device: string; count: number }>
  conversion_funnel: Array<{ step: string; count: number; conversion_rate: string }>
}

interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  timestamp: number
  session_id: string
  user_id: string
  page_url: string
  device_type: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Buscar estatísticas
      const statsResponse = await fetch("/api/analytics?type=stats")
      const statsData = await statsResponse.json()
      setStats(statsData.data[0])

      // Buscar eventos recentes
      const eventsResponse = await fetch("/api/analytics?type=events&limit=50")
      const eventsData = await eventsResponse.json()
      setEvents(eventsData.data)

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Erro ao buscar analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR")
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />
      case "tablet":
        return <Tablet className="w-4 h-4" />
      case "desktop":
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getEventIcon = (event: string) => {
    switch (event) {
      case "page_view":
        return <Eye className="w-4 h-4" />
      case "product_view":
        return <Eye className="w-4 h-4" />
      case "add_to_cart":
        return <ShoppingCart className="w-4 h-4" />
      case "checkout_start":
        return <CreditCard className="w-4 h-4" />
      case "purchase":
        return <TrendingUp className="w-4 h-4" />
      case "click":
        return <MousePointer className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify({ stats, events }, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `analytics-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Última atualização: {formatTimestamp(lastUpdate.getTime())}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAnalytics} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <p className="text-xs text-muted-foreground">{stats.sessions_24h} sessões nas últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_events}</div>
                <p className="text-xs text-muted-foreground">{stats.events_24h} eventos nas últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_sessions}</div>
                <p className="text-xs text-muted-foreground">{stats.sessions_7d} sessões nos últimos 7 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.conversion_funnel.find((f) => f.step === "purchase")?.conversion_rate || "0.00"}%
                </div>
                <p className="text-xs text-muted-foreground">Visitantes que compraram</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="funnel">Funil de Conversão</TabsTrigger>
            <TabsTrigger value="traffic">Tráfego</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Eventos Mais Frequentes</CardTitle>
                  <CardDescription>Últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.top_events.map((event, index) => (
                      <div key={event.event} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.event)}
                          <span className="text-sm">{event.event}</span>
                        </div>
                        <Badge variant="secondary">{event.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Dispositivos</CardTitle>
                  <CardDescription>Distribuição por tipo de dispositivo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.device_breakdown.map((device) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.device)}
                          <span className="text-sm capitalize">{device.device}</span>
                        </div>
                        <Badge variant="secondary">{device.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Páginas Mais Visitadas</CardTitle>
                  <CardDescription>Últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.top_pages.map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between">
                        <span className="text-sm font-mono">{page.page}</span>
                        <Badge variant="secondary">{page.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* UTM Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Fontes de Tráfego</CardTitle>
                  <CardDescription>UTM Sources mais frequentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.top_utm_sources.length ? (
                      stats.top_utm_sources.map((source) => (
                        <div key={source.source} className="flex items-center justify-between">
                          <span className="text-sm">{source.source}</span>
                          <Badge variant="secondary">{source.count}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma fonte UTM detectada</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Recentes</CardTitle>
                <CardDescription>Últimos 50 eventos capturados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {events.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.event)}
                        <div>
                          <span className="font-medium">{event.event}</span>
                          <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(event.device_type)}
                          <span className="text-xs">{event.device_type}</span>
                        </div>
                        {event.utm_source && (
                          <Badge variant="outline" className="text-xs">
                            {event.utm_source}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>Jornada do usuário até a compra</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.conversion_funnel.map((step, index) => (
                    <div key={step.step} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium capitalize">{step.step.replace("_", " ")}</h3>
                          <p className="text-sm text-gray-500">{step.count} usuários</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{step.conversion_rate}%</div>
                        <p className="text-xs text-gray-500">Taxa de conversão</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Tráfego</CardTitle>
                  <CardDescription>Estatísticas gerais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Eventos hoje:</span>
                      <span className="font-bold">{stats?.events_24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eventos esta semana:</span>
                      <span className="font-bold">{stats?.events_7d}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessões hoje:</span>
                      <span className="font-bold">{stats?.sessions_24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessões esta semana:</span>
                      <span className="font-bold">{stats?.sessions_7d}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qualidade do Tráfego</CardTitle>
                  <CardDescription>Métricas de engajamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Eventos por sessão:</span>
                      <span className="font-bold">
                        {stats?.total_sessions ? (stats.total_events / stats.total_sessions).toFixed(1) : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessões por usuário:</span>
                      <span className="font-bold">
                        {stats?.total_users ? (stats.total_sessions / stats.total_users).toFixed(1) : "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
