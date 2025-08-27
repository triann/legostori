"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface AnalyticsTrackerProps {
  children: React.ReactNode
}

export function AnalyticsTracker({ children }: AnalyticsTrackerProps) {
  const [isClient, setIsClient] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)

    import("@/hooks/use-analytics").then(({ useAnalytics }) => {
      // This will be handled in a separate effect
    })
  }, [])

  useEffect(() => {
    if (!isClient) return

    const initializeAnalytics = async () => {
      try {
        const { useAnalytics } = await import("@/hooks/use-analytics")
        // We can't use hooks dynamically, so we'll handle errors differently

        const handleError = (event: ErrorEvent) => {
          fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "javascript_error",
              properties: {
                message: event.message,
                filename: event.filename,
                line_number: event.lineno,
                column_number: event.colno,
                stack: event.error?.stack,
              },
              timestamp: Date.now(),
              session_id: "error_session",
              user_id: "error_user",
              page_url: window.location.href,
              referrer: document.referrer,
              user_agent: navigator.userAgent,
              device_type: "desktop",
            }),
          }).catch(() => {}) // Ignore fetch errors for error tracking
        }

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
          fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "unhandled_promise_rejection",
              properties: {
                message: event.reason?.toString() || "Unknown error",
                reason: event.reason,
              },
              timestamp: Date.now(),
              session_id: "error_session",
              user_id: "error_user",
              page_url: window.location.href,
              referrer: document.referrer,
              user_agent: navigator.userAgent,
              device_type: "desktop",
            }),
          }).catch(() => {}) // Ignore fetch errors for error tracking
        }

        window.addEventListener("error", handleError)
        window.addEventListener("unhandledrejection", handleUnhandledRejection)

        return () => {
          window.removeEventListener("error", handleError)
          window.removeEventListener("unhandledrejection", handleUnhandledRejection)
        }
      } catch (error) {
        console.error("[Analytics] Failed to initialize:", error)
      }
    }

    const cleanup = initializeAnalytics()

    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.())
    }
  }, [isClient])

  return <>{children}</>
}
