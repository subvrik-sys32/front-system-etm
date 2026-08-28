"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"

const FOCUS_KEYS = ["taskId", "projectId", "focus", "tab"] as const

/**
 * Captura deep-link UNA vez por key.
 * No re-dispara si finish() limpia el store antes de que la URL se strippee
 * (eso causaba el loop infinito de router.replace / RSC).
 */
export function useDeepLinkCapture() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const begin = useDeepLinkRoute(s => s.begin)

  /** Keys ya capturadas en esta montura de página (no dependen del store). */
  const capturedRef = useRef<string | null>(null)

  // Nueva página → permitir un deep-link nuevo
  useEffect(() => {
    capturedRef.current = null
  }, [pathname])

  useEffect(() => {
    const taskId = searchParams.get("taskId") ?? undefined
    const projectId = searchParams.get("projectId") ?? undefined
    const focusToken = searchParams.get("focus") ?? undefined
    const tab = searchParams.get("tab")

    if (!taskId && !projectId && !focusToken && !tab) return

    const key =
      focusToken ??
      `entity:${taskId ?? ""}:${projectId ?? ""}:tab:${tab ?? ""}`

    // Ya capturamos esta llegada → no volver a begin/replace
    if (capturedRef.current === key) return
    capturedRef.current = key

    useFocusNavStore.getState().end()
    begin({ taskId, projectId, focusToken, tab, key })

    const next = new URLSearchParams(searchParams.toString())
    let changed = false
    for (const k of FOCUS_KEYS) {
      if (next.has(k)) {
        next.delete(k)
        changed = true
      }
    }
    if (!changed) return

    const href = next.toString() ? `${pathname}?${next}` : pathname
    router.replace(href, { scroll: false })
  }, [searchParams, router, pathname, begin])
}
