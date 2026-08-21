"use client"

import { useEffect, type ReactNode } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { usePageToolbarStore } from "../page-toolbar-store"

/**
 * Publica la toolbar de lista en el chrome del shell (desktop/tablet).
 * En mobile no publica: la page sigue montando EntityToolbar dentro de AppListScroll.
 */
export function usePageToolbar(toolbar: ReactNode | null) {
  const setToolbar = usePageToolbarStore(s => s.setToolbar)
  const { isMobile } = useResponsive()

  useEffect(() => {
    setToolbar(isMobile ? null : toolbar)
    return () => setToolbar(null)
  }, [toolbar, isMobile, setToolbar])
}
