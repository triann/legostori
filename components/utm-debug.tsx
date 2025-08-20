"use client"

import { useEffect, useState } from "react"
import { UTMManager, type UTMParams } from "@/lib/utm-manager"

export function UTMDebug() {
  const [utmParams, setUtmParams] = useState<UTMParams>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Só mostrar em desenvolvimento
    if (process.env.NODE_ENV !== "development") return

    const manager = UTMManager.getInstance()
    setUtmParams(manager.getUTMParams())

    // Atualizar a cada 5 segundos
    const interval = setInterval(() => {
      setUtmParams(manager.getUTMParams())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== "development") return null

  const hasParams = Object.values(utmParams).some((value) => value)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`px-3 py-2 rounded-lg text-xs font-mono ${
          hasParams ? "bg-green-500 text-white" : "bg-gray-500 text-white"
        }`}
      >
        UTM {hasParams ? "✓" : "✗"}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-black text-white p-4 rounded-lg text-xs font-mono w-80 max-h-60 overflow-auto">
          <div className="mb-2 font-bold">UTM Parameters:</div>
          {hasParams ? (
            <pre className="whitespace-pre-wrap">{JSON.stringify(utmParams, null, 2)}</pre>
          ) : (
            <div className="text-gray-400">Nenhum parâmetro UTM capturado</div>
          )}
          <button
            onClick={() => UTMManager.getInstance().debug()}
            className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
          >
            Debug Console
          </button>
        </div>
      )}
    </div>
  )
}
