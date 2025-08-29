"use client"

import { useState, useEffect } from "react"
import { trackingLogger, type TrackingLog } from "@/lib/tracking-logger"

export default function TrackingDebugPanel() {
  const [logs, setLogs] = useState<TrackingLog[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "meta" | "utmify">("all")

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(trackingLogger.getLogs())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const filteredLogs =
    filter === "all" ? logs : logs.filter((log) => log.platform === filter || log.platform === "both")

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <>
      {/* Botão flutuante para abrir o painel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        title="Debug Tracking"
      >
        📊
      </button>

      {/* Painel de debug */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden">
          <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">Tracking Debug</h3>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="all">Todos</option>
                <option value="meta">Meta</option>
                <option value="utmify">UTMify</option>
              </select>
              <button
                onClick={() => trackingLogger.clearLogs()}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80 p-2">
            {filteredLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum evento registrado</p>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`font-semibold ${
                        log.platform === "meta"
                          ? "text-blue-600"
                          : log.platform === "utmify"
                            ? "text-green-600"
                            : "text-purple-600"
                      }`}
                    >
                      {log.platform.toUpperCase()} - {log.event}
                    </span>
                    <span
                      className={`px-1 rounded text-xs ${
                        log.status === "success"
                          ? "bg-green-100 text-green-800"
                          : log.status === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="text-gray-600 mb-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  {log.error && <div className="text-red-600 text-xs">Erro: {log.error}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
