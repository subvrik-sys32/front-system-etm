// shared/responsive/breakpoints.ts

// Única fuente de verdad. Todo el sistema (Tailwind config,
// ResponsiveProvider, detección server-side) lee de acá.
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
} as const

export type BreakpointName = keyof typeof BREAKPOINTS

export const BREAKPOINT_ORDER: BreakpointName[] = [
  "mobile",
  "tablet",
  "laptop",
  "desktop",
  "wide",
]

// Dado un ancho en px, devuelve el breakpoint activo.
export function resolveBreakpoint(width: number): BreakpointName {

  let current: BreakpointName = "mobile"

  for (const name of BREAKPOINT_ORDER) {
    if (width >= BREAKPOINTS[name]) {
      current = name
    }
  }

  return current

}