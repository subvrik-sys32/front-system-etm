// shared/responsive/use-responsive.ts
"use client"

import { useContext } from "react"

import { ResponsiveContext } from "../responsive-context"

export function useResponsive() {

  const context = useContext(ResponsiveContext)

  if (!context) {
    throw new Error(
      "useResponsive debe usarse dentro de un ResponsiveProvider",
    )
  }

  return context

}