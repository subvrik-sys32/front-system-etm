"use client"

import { useEffect, type ReactNode } from "react"

import { usePageToolbarStore } from "../page-toolbar-store"

/**
 * Publica la toolbar en el chrome del shell (DesktopTopBar y TopBar móvil).
 * La page decide cuándo pasar null (p.ej. listas en mobile usan EntityToolbar
 * dentro del scroll). CAD landscape sí publica para meter el toggle en TopBar.
 */
export function usePageToolbar(toolbar: ReactNode | null) {
  const setToolbar = usePageToolbarStore(s => s.setToolbar)

  useEffect(() => {
    setToolbar(toolbar)
    return () => setToolbar(null)
  }, [toolbar, setToolbar])
}
