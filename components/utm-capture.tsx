"use client"

import { useEffect } from "react"

export function UTMCapture() {
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    console.log(`[UTM] Dispositivo: ${isMobile ? "Mobile" : "Desktop"}`)

    const urlParams = new URLSearchParams(window.location.search)
    console.log(`[UTM] URL atual: ${window.location.href}`)
    console.log(`[UTM] Parâmetros da URL:`, Object.fromEntries(urlParams.entries()))

    const utmParams = {
      utm_source: urlParams.get("utm_source"),
      utm_medium: urlParams.get("utm_medium"),
      utm_campaign: urlParams.get("utm_campaign"),
      utm_content: urlParams.get("utm_content"),
      utm_term: urlParams.get("utm_term"),
      xcod: urlParams.get("xcod"),
      sck: urlParams.get("sck"),
      utm_id: urlParams.get("utm_id"),
      fbclid: urlParams.get("fbclid"),
      gclid: urlParams.get("gclid"),
      ttclid: urlParams.get("ttclid"),
    }

    // Filtrar apenas valores não nulos
    const filteredUtmParams = Object.fromEntries(
      Object.entries(utmParams).filter(([_, value]) => value !== null && value !== ""),
    )

    try {
      if (typeof Storage !== "undefined") {
        // Salvar no localStorage apenas se houver parâmetros UTM
        if (Object.keys(filteredUtmParams).length > 0) {
          localStorage.setItem("utmParams", JSON.stringify(filteredUtmParams))
          console.log(
            `[UTM] ${isMobile ? "Mobile" : "Desktop"} - Parâmetros UTM capturados e salvos:`,
            filteredUtmParams,
          )

          const saved = localStorage.getItem("utmParams")
          if (saved) {
            console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Confirmação de salvamento:`, JSON.parse(saved))
          } else {
            console.error(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - ERRO: Não foi possível salvar no localStorage`)
          }
        } else {
          console.log(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Nenhum parâmetro UTM encontrado na URL`)

          const existingUtm = localStorage.getItem("utmParams")
          if (existingUtm) {
            console.log(
              `[UTM] ${isMobile ? "Mobile" : "Desktop"} - UTM existentes encontrados:`,
              JSON.parse(existingUtm),
            )
          }
        }
      } else {
        console.error(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - localStorage não está disponível`)
      }
    } catch (error) {
      console.error(`[UTM] ${isMobile ? "Mobile" : "Desktop"} - Erro ao acessar localStorage:`, error)
    }
  }, [])

  // Componente invisível - apenas para captura de UTM
  return null
}
