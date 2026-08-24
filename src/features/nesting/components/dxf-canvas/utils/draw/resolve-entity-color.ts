/** Tema actual del documento (SSR-safe). */
export function isDarkTheme(): boolean {
  if (typeof document === "undefined") return true
  return document.documentElement.classList.contains("dark")
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  let h = m[1]
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b))
    .toString(16)
    .slice(1)}`
}

/** Luminancia relativa WCAG 0–1. */
export function luminance(hex: string): number {
  const rgb = parseHex(hex)
  if (!rgb) return 0.5
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const [r, g, b] = rgb
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function mix(a: string, b: string, t: number): string {
  const pa = parseHex(a)
  const pb = parseHex(b)
  if (!pa || !pb) return a
  return toHex(
    pa[0] + (pb[0] - pa[0]) * t,
    pa[1] + (pb[1] - pa[1]) * t,
    pa[2] + (pb[2] - pa[2]) * t,
  )
}

/**
 * Color de trazo de entidad DXF legible en light y dark.
 * - ACI 7 / casi blanco / casi negro → foreground del tema
 * - En light, pasteles muy claros se oscurecen para no perderse
 */
export function resolveEntityStroke(hex: string): string {
  const dark = isDarkTheme()
  const fg = dark ? "#f4f4f5" : "#171717"
  const L = luminance(hex)

  // Blanco/negro CAD (ACI 7 y similares)
  if (L > 0.88 || L < 0.08) return fg

  // Light: colores muy claros pierden contraste sobre fondo claro
  if (!dark && L > 0.62) {
    return mix(hex, "#171717", 0.42)
  }

  // Dark: colores muy oscuros se pierden sobre fondo negro
  if (dark && L < 0.22) {
    return mix(hex, "#f4f4f5", 0.35)
  }

  return hex
}

/** Borde de plancha según tema. */
export function resolveSheetStroke(): string {
  return isDarkTheme() ? "#a1a1aa" : "#52525b"
}