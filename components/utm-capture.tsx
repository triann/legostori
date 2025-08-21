"use client"

import { useEffect } from "react"

export function UTMCapture() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

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

    // Salvar no localStorage apenas se houver parâmetros UTM
    if (Object.keys(filteredUtmParams).length > 0) {
      localStorage.setItem("utmParams", JSON.stringify(filteredUtmParams))
      console.log("[UTM] Parâmetros UTM capturados e salvos:", filteredUtmParams)
    } else {
      console.log("[UTM] Nenhum parâmetro UTM encontrado na URL")
    }
  }, [])

  // Componente invisível - apenas para captura de UTM
  return null
}
