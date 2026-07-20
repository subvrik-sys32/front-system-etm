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
  // false hasta que el cliente corrió su primera medición real con
  // matchMedia. Antes de eso, `breakpoint` es solo una adivinanza
  // por User-Agent (ver get-initial-breakpoint.ts) — puede estar
  // mal para ventanas de desktop angostas, tablets en landscape,
  // etc. Componentes que renderizan árboles MUY distintos según el
  // breakpoint (como AppShell: sidebar vs. bottom nav) deberían
  // esperar a `ready` antes de decidir, para no mostrar el layout
  // adivinado y después saltar al real.
  ready: boolean
}

export const ResponsiveContext =
  createContext<ResponsiveState | null>(null)

function buildState(breakpoint: BreakpointName, ready: boolean): ResponsiveState {

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isLaptop: breakpoint === "laptop",
    isDesktop: breakpoint === "desktop",
    isWide: breakpoint === "wide",
    isCompact: breakpoint === "mobile" || breakpoint === "tablet",
    ready,
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

  const [ready, setReady] = useState(false)

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

      const shortSide = Math.min(
        window.innerWidth,
        window.innerHeight,
      )

      setBreakpoint(resolveBreakpoint(shortSide))
      setReady(true)

    }

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

  const state = buildState(breakpoint, ready)

  return (
    <ResponsiveContext.Provider value={state}>
      {children}
    </ResponsiveContext.Provider>
  )

}