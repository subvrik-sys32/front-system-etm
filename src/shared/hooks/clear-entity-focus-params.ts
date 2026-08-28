"use client"

import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"

const FOCUS_PARAM_KEYS = ["taskId", "projectId", "focus", "tab"] as const
const ORIGIN_STORAGE_KEYS = [
  "process-origin-task-id",
  "task-origin-project-id",
  "process-origin-code",
  "process-origin-focus-task-id",
] as const

type RouterLike = {
  replace: (href: string, options?: { scroll?: boolean }) => void
}

function clearOriginButtons() {
  if (typeof sessionStorage === "undefined") return
  for (const key of ORIGIN_STORAGE_KEYS) {
    sessionStorage.removeItem(key)
  }
  window.dispatchEvent(new Event("entity-origin-cleared"))
}

export function clearEntityFocusParams(
  router: RouterLike,
  pathname: string,
  searchParams: { toString(): string },
): void {
  const hadRoute = useDeepLinkRoute.getState().route != null
  const next = new URLSearchParams(searchParams.toString())
  let hadParams = false
  for (const key of FOCUS_PARAM_KEYS) {
    if (next.has(key)) {
      next.delete(key)
      hadParams = true
    }
  }

  useDeepLinkRoute.getState().cancel()
  useFocusNavStore.getState().end()

  if (hadParams || hadRoute) clearOriginButtons()
  if (!hadParams) return
  const query = next.toString()
  router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
}
