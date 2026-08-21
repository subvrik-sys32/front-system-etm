"use client"

import { useEffect, type ReactNode } from "react"

import { usePageActionsStore } from "../page-actions-store"

/**
 * Publica acciones de página en DesktopTopBar (derecha del título).
 * En mobile normalmente el FAB/AdaptiveActionBar ya cubre esto;
 * igual se puede usar si hace falta en el chrome.
 */
export function usePageActions(actions: ReactNode | null) {
  const setActions = usePageActionsStore(s => s.setActions)

  useEffect(() => {
    setActions(actions)
    return () => setActions(null)
  }, [actions, setActions])
}
