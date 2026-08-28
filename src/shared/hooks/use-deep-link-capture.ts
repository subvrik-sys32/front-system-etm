"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"

const FOCUS_KEYS = ["taskId", "projectId", "focus", "tab"] as const

export function useDeepLinkCapture() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const begin = useDeepLinkRoute(s => s.begin)
  const routeKey = useDeepLinkRoute(s => s.route?.key ?? null)

  useEffect(() => {
    const taskId = searchParams.get("taskId") ?? undefined
    const projectId = searchParams.get("projectId") ?? undefined
    const focusToken = searchParams.get("focus") ?? undefined
    const tab = searchParams.get("tab")

    if (!taskId && !projectId && !focusToken && !tab) return

    const key =
      focusToken ??
      `entity:${taskId ?? ""}:${projectId ?? ""}:tab:${tab ?? ""}`

    if (routeKey === key) return

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
    const q = next.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }, [searchParams, router, pathname, begin, routeKey])
}
