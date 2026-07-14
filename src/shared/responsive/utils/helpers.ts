// shared/responsive/helpers.ts
"use client"

import type { BreakpointName } from "../breakpoints"

// Devuelve el primer valor definido según el breakpoint actual,
// cayendo hacia abajo en la escala (mobile-first fallback).
// Ejemplo: adaptive(breakpoint, { mobile: 1, laptop: 3 }) en "tablet" -> 1
export function adaptive<T>(
  breakpoint: BreakpointName,
  values: Partial<Record<BreakpointName, T>>,
): T | undefined {

  const order: BreakpointName[] =
    ["wide", "desktop", "laptop", "tablet", "mobile"]

  const startIndex = order.indexOf(breakpoint)

  for (let i = startIndex; i < order.length; i++) {

    const value = values[order[i]]

    if (value !== undefined) {
      return value
    }

  }

  return undefined

}