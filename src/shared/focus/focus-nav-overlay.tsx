"use client"

import { Spinner } from "@/shared/ui/spinner/spinner"
import { selectIsDirecting, useDeepLinkRoute } from "@/shared/focus/deep-link-route"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"

export function FocusNavOverlay() {
  const directing = useDeepLinkRoute(selectIsDirecting)
  const navActive = useFocusNavStore(s => s.active)
  const label = useFocusNavStore(s => s.label)
  if (!directing && !navActive) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/55 backdrop-blur-md"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-chrome px-6 py-5 shadow-xs">
        <Spinner size={22} className="text-primary" />
        <p className="text-sm font-medium text-foreground">
          {directing ? "Dirigiendo…" : (label ?? "Dirigiendo…")}
        </p>
      </div>
    </div>
  )
}
