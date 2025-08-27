"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"

interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  timestamp: number
  session_id: string
  user_id: string
  page_url: string
  referrer: string
  user_agent: string
  device_type: "mobile" | "tablet" | "desktop"
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

interface UserSession {
  session_id: string
  user_id: string
  start_time: number
  last_activity: number
  page_views: number
  events: number
}

export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sessionData, setSessionData] = useState<UserSession | null>(null)
  const startTime = useRef<number>(Date.now())
  const lastScrollDepth = useRef<number>(0)
  const timeOnPage = useRef<number>(0)
  const pageViewSent = useRef<boolean>(false)
  const sessionInitialized = useRef<boolean>(false)

  // Gerar IDs únicos
  const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Detectar tipo de dispositivo
  const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
    if (typeof window === "undefined") return "desktop"
    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }

  // Obter dados da sessão
  const getSessionData = (): UserSession => {
    if (typeof window === "undefined") {
      return {
        session_id: generateId(),
        user_id: generateId(),
        start_time: Date.now(),
        last_activity: Date.now(),
        page_views: 0,
        events: 0,
      }
    }

    let sessionId = localStorage.getItem("analytics_session_id")
    let userId = localStorage.getItem("analytics_user_id")

    if (!sessionId) {
      sessionId = generateId()
      localStorage.setItem("analytics_session_id", sessionId)
    }

    if (!userId) {
      userId = generateId()
      localStorage.setItem("analytics_user_id", userId)
    }

    const sessionStart = localStorage.getItem("analytics_session_start")
    const now = Date.now()

    // Nova sessão se passou mais de 30 minutos
    if (!sessionStart || now - Number.parseInt(sessionStart) > 30 * 60 * 1000) {
      sessionId = generateId()
      localStorage.setItem("analytics_session_id", sessionId)
      localStorage.setItem("analytics_session_start", now.toString())
    }

    return {
      session_id: sessionId,
      user_id: userId,
      start_time: Number.parseInt(sessionStart || now.toString()),
      last_activity: now,
      page_views: Number.parseInt(localStorage.getItem("analytics_page_views") || "0"),
      events: Number.parseInt(localStorage.getItem("analytics_events") || "0"),
    }
  }

  const searchParamsObj = useMemo(() => {
    return Object.fromEntries(searchParams.entries())
  }, [searchParams])

  const initializeSession = useCallback(() => {
    if (sessionInitialized.current) return
    sessionInitialized.current = true

    const session = getSessionData()
    setSessionData(session)
  }, [])

  const sendEvent = useCallback(async (event: string, properties: Record<string, any> = {}) => {
    if (typeof window === "undefined") return

    const session = getSessionData()
    const urlParams = new URLSearchParams(window.location.search)

    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        scroll_depth: lastScrollDepth.current,
        time_on_page: Date.now() - startTime.current,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        connection_type: (navigator as any).connection?.effectiveType || "unknown",
      },
      timestamp: Date.now(),
      session_id: session.session_id,
      user_id: session.user_id,
      page_url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      utm_source: urlParams.get("utm_source") || undefined,
      utm_medium: urlParams.get("utm_medium") || undefined,
      utm_campaign: urlParams.get("utm_campaign") || undefined,
      utm_content: urlParams.get("utm_content") || undefined,
      utm_term: urlParams.get("utm_term") || undefined,
    }

    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })

      // Atualizar contadores locais
      session.events += 1
      session.last_activity = Date.now()
      localStorage.setItem("analytics_events", session.events.toString())
      localStorage.setItem("analytics_last_activity", session.last_activity.toString())
    } catch (error) {
      console.error("[Analytics] Erro ao enviar evento:", error)
    }
  }, [])

  const trackPageView = useCallback(() => {
    if (pageViewSent.current) return
    pageViewSent.current = true

    const session = getSessionData()
    session.page_views += 1
    localStorage.setItem("analytics_page_views", session.page_views.toString())

    sendEvent("page_view", {
      page_title: document.title,
      page_path: pathname,
      search_params: searchParamsObj,
      is_first_visit: session.page_views === 1,
      session_page_views: session.page_views,
    })
  }, [pathname, searchParamsObj, sendEvent])

  // Track scroll depth
  const trackScrollDepth = () => {
    if (typeof window === "undefined") return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / docHeight) * 100)

    if (scrollPercent > lastScrollDepth.current) {
      lastScrollDepth.current = scrollPercent

      // Enviar eventos em marcos específicos
      if ([25, 50, 75, 100].includes(scrollPercent)) {
        sendEvent("scroll_depth", {
          depth_percent: scrollPercent,
          depth_pixels: scrollTop,
          page_height: docHeight + window.innerHeight,
        })
      }
    }
  }

  // Track time on page
  const trackTimeOnPage = () => {
    const currentTime = Date.now() - startTime.current
    timeOnPage.current = currentTime

    // Enviar eventos de tempo em marcos específicos (30s, 1min, 2min, 5min)
    const timeInSeconds = Math.floor(currentTime / 1000)
    if ([30, 60, 120, 300].includes(timeInSeconds)) {
      sendEvent("time_on_page", {
        time_seconds: timeInSeconds,
        time_minutes: Math.floor(timeInSeconds / 60),
      })
    }
  }

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Track page view
    trackPageView()

    // Setup scroll tracking
    const handleScroll = () => trackScrollDepth()
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Setup time tracking
    const timeInterval = setInterval(trackTimeOnPage, 1000)

    // Track page exit
    const handleBeforeUnload = () => {
      sendEvent("page_exit", {
        time_on_page: Date.now() - startTime.current,
        final_scroll_depth: lastScrollDepth.current,
        exit_type: "beforeunload",
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendEvent("page_exit", {
          time_on_page: Date.now() - startTime.current,
          final_scroll_depth: lastScrollDepth.current,
          exit_type: "visibility_hidden",
        })
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(timeInterval)
    }
  }, [trackPageView, sendEvent])

  useEffect(() => {
    pageViewSent.current = false
    startTime.current = Date.now()
    lastScrollDepth.current = 0
    timeOnPage.current = 0
  }, [pathname])

  const trackingMethods = useMemo(
    () => ({
      trackEvent: sendEvent,
      trackPageView,
      sessionData,
      trackClick: (element: string, properties?: Record<string, any>) => sendEvent("click", { element, ...properties }),
      trackFormStart: (formName: string, properties?: Record<string, any>) =>
        sendEvent("form_start", { form_name: formName, ...properties }),
      trackFormSubmit: (formName: string, properties?: Record<string, any>) =>
        sendEvent("form_submit", { form_name: formName, ...properties }),
      trackFormError: (formName: string, error: string, properties?: Record<string, any>) =>
        sendEvent("form_error", { form_name: formName, error, ...properties }),
      trackProductView: (productId: string, productName: string, price: number, properties?: Record<string, any>) =>
        sendEvent("product_view", { product_id: productId, product_name: productName, price, ...properties }),
      trackAddToCart: (
        productId: string,
        productName: string,
        price: number,
        quantity: number,
        properties?: Record<string, any>,
      ) =>
        sendEvent("add_to_cart", { product_id: productId, product_name: productName, price, quantity, ...properties }),
      trackRemoveFromCart: (productId: string, properties?: Record<string, any>) =>
        sendEvent("remove_from_cart", { product_id: productId, ...properties }),
      trackCheckoutStart: (cartValue: number, itemCount: number, properties?: Record<string, any>) =>
        sendEvent("checkout_start", { cart_value: cartValue, item_count: itemCount, ...properties }),
      trackPaymentMethod: (method: string, properties?: Record<string, any>) =>
        sendEvent("payment_method_selected", { method, ...properties }),
      trackPurchase: (orderId: string, value: number, items: any[], properties?: Record<string, any>) =>
        sendEvent("purchase", { order_id: orderId, value, items, ...properties }),
      trackSearch: (query: string, results: number, properties?: Record<string, any>) =>
        sendEvent("search", { query, results_count: results, ...properties }),
      trackVideoPlay: (videoId: string, properties?: Record<string, any>) =>
        sendEvent("video_play", { video_id: videoId, ...properties }),
      trackFileDownload: (fileName: string, fileType: string, properties?: Record<string, any>) =>
        sendEvent("file_download", { file_name: fileName, file_type: fileType, ...properties }),
      trackError: (errorType: string, errorMessage: string, properties?: Record<string, any>) =>
        sendEvent("error", { error_type: errorType, error_message: errorMessage, ...properties }),
    }),
    [sendEvent, trackPageView, sessionData],
  )

  return trackingMethods
}
