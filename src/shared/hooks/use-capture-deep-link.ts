"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useFocusIntentStore } from "@/shared/focus/store/focus-intent-store"
import { stripDeepLinkSearchParams } from "@/shared/hooks/clear-entity-focus-params"

/**
 * URL → intent store (una vez) → strip URL.
 * No llama clearEntityFocusParams (eso consumiría el intent recién capturado).
 */
export function useCaptureDeepLink() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const capture = useFocusIntentStore(s => s.capture)
  const intentKey = useFocusIntentStore(s => s.intent?.key ?? null)

  useEffect(() => {
    const taskId = searchParams.get("taskId") ?? undefined
    const projectId = searchParams.get("projectId") ?? undefined
    const focusToken = searchParams.get("focus") ?? undefined
    const tab = searchParams.get("tab")

    if (!taskId && !projectId && !focusToken && !tab) return

    const key =
      focusToken ??
      `entity:${taskId ?? ""}:${projectId ?? ""}:tab:${tab ?? ""}`

    if (intentKey === key) return

    capture({
      taskId,
      projectId,
      focusToken,
      tab,
      key,
    })

    stripDeepLinkSearchParams(router, pathname, searchParams)
  }, [searchParams, router, pathname, capture, intentKey])
}
