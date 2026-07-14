// shared/responsive/responsive-context.tsx
"use client"

import { createContext, useEffect, useState } from "react"

import {
  BREAKPOINTS,
  resolveBreakpoint,
  type BreakpointName,
} from "./breakpoints"

export type ResponsiveState = {
  breakpoint: BreakpointName
  isMobile: boolean
  isTablet: boolean
  isLaptop: boolean
  isDesktop: boolean
  isWide: boolean
  // Atajo de uso muy frecuente: "estamos en un layout compacto"
  // (mobile o tablet), útil para decisiones binarias rápidas.
  isCompact: boolean
}

export const ResponsiveContext =
  createContext<ResponsiveState | null>(null)

function buildState(breakpoint: BreakpointName): ResponsiveState {

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isLaptop: breakpoint === "laptop",
    isDesktop: breakpoint === "desktop",
    isWide: breakpoint === "wide",
    isCompact: breakpoint === "mobile" || breakpoint === "tablet",
  }

}

type Props = {
  initialBreakpoint: BreakpointName
  children: React.ReactNode
}

export function ResponsiveProvider({
  initialBreakpoint,
  children,
}: Props) {

  // Arranca con el valor que vino del server (sin flash).
  const [breakpoint, setBreakpoint] =
    useState<BreakpointName>(initialBreakpoint)

  useEffect(() => {

    // matchMedia por breakpoint: más barato que un resize listener
    // recalculando todo, y no dispara renders de más entre breakpoints.
    const queries = (Object.keys(BREAKPOINTS) as BreakpointName[]).map(
      name => ({
        name,
        mql: window.matchMedia(`(min-width: ${BREAKPOINTS[name]}px)`),
      }),
    )

    const recompute = () => {
      setBreakpoint(resolveBreakpoint(window.innerWidth))
    }

    // Corrige de inmediato si el UA del server se equivocó
    // (ej. ventana desktop angosta, o UA no reconocido).
    recompute()

    queries.forEach(({ mql }) => {
      mql.addEventListener("change", recompute)
    })

    return () => {
      queries.forEach(({ mql }) => {
        mql.removeEventListener("change", recompute)
      })
    }

  }, [])

  const state = buildState(breakpoint)

  return (
    <ResponsiveContext.Provider value={state}>
      {children}
    </ResponsiveContext.Provider>
  )

}