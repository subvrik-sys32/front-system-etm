/** Oscuro del badge — stop final del surface. */
export const FINISH_BADGE_DARK = "#17191d"

/**
 * Degradado 105deg + color-mix.
 * Centrado para que la transición caiga exactamente sobre el separador.
 */
export function getFinishMaterialSurface(finishHex: string): string {
  const c = finishHex.trim() || "#64748B"
  const d = FINISH_BADGE_DARK

  return [
    `linear-gradient(
      105deg,
      ${c} 0%,
      ${c} 45%,
      color-mix(in srgb, ${c} 65%, ${d}) 60%,
      color-mix(in srgb, ${c} 25%, ${d}) 78%,
      ${d} 100%
    )`,
    `linear-gradient(
      180deg,
      rgba(255,255,255,0.07) 0%,
      rgba(255,255,255,0.015) 50%,
      rgba(0,0,0,0.08) 100%
    )`,
  ]
    .join(", ")
    .replace(/\s+/g, " ")
    .trim()
}