"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"

const FOCUS_KEYS = ["taskId", "projectId", "focus", "tab"] as const
const CONSUMED_PREFIX = "etm:deeplink:consumed:"

function isConsumed(key: string): boolean {
  try {
    return sessionStorage.getItem(CONSUMED_PREFIX + key) === "1"
  } catch {
    return false
  }
}

function markConsumed(key: string) {
  try {
    sessionStorage.setItem(CONSUMED_PREFIX + key, "1")
  } catch {
    /* private mode / quota — el strip síncrono sigue cubriendo el caso */
  }
}

/** Quita params de deep-link. Devuelve href limpio o null si no había nada. */
function stripFocusParams(
  pathname: string,
  searchParams: URLSearchParams,
): string | null {
  const next = new URLSearchParams(searchParams.toString())
  let changed = false
  for (const k of FOCUS_KEYS) {
    if (next.has(k)) {
      next.delete(k)
      changed = true
    }
  }
  if (!changed) return null
  const q = next.toString()
  return q ? `${pathname}?${q}` : pathname
}

/**
 * Strip síncrono del URL (history.replaceState) + router.replace.
 * Gana la carrera ante F5: la barra queda limpia antes del paint siguiente.
 */
function applyStrip(href: string, router: { replace: (h: string, o?: { scroll?: boolean }) => void }) {
  if (typeof window !== "undefined") {
    window.history.replaceState(window.history.state, "", href)
  }
  router.replace(href, { scroll: false })
}

/**
 * Captura deep-link UNA vez por key (focus UUID o entity+tab).
 * - sessionStorage: F5 con la misma URL no vuelve a abrir el dialog
 * - replaceState síncrono: la URL se limpia aunque router.replace vaya tarde
 */
export function useDeepLinkCapture() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const begin = useDeepLinkRoute(s => s.begin)

  /** Keys ya capturadas en esta montura de página. */
  const capturedRef = useRef<string | null>(null)

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

    // Ya capturada en este mount
    if (capturedRef.current === key) {
      const href = stripFocusParams(pathname, searchParams)
      if (href) applyStrip(href, router)
      return
    }

    // Ya consumida en esta sesión (p. ej. F5 con URL aún sucia)
    if (isConsumed(key)) {
      const href = stripFocusParams(pathname, searchParams)
      if (href) applyStrip(href, router)
      return
    }

    capturedRef.current = key
    markConsumed(key)

    useFocusNavStore.getState().end()
    begin({ taskId, projectId, focusToken, tab, key })

    const href = stripFocusParams(pathname, searchParams)
    if (href) applyStrip(href, router)
  }, [searchParams, router, pathname, begin])
}
