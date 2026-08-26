/** Oscuro del badge — stop final del surface. */
export const FINISH_BADGE_DARK = "#17191d"

/**
 * Degradado 105deg + color-mix.
 * `sepPct` = posición del separador en % del ancho del badge (medido).
 * Sin mask, sin capa extra, sin borde de box anidado.
 */
export function getFinishMaterialSurface(
  finishHex: string,
  sepPct: number = 36,
): string {
  const c = finishHex.trim() || "#64748B"
  const d = FINISH_BADGE_DARK
  const s = Math.min(88, Math.max(12, sepPct))

  // Sólido hasta antes del separador; fundido centrado en s; oscuro después.
  const solidEnd = Math.max(0, s - 12)
  const mix1 = Math.max(0, s - 3)
  const mix2 = Math.min(100, s + 8)
  const darkStart = Math.min(100, s + 16)

  return [
    `linear-gradient(
      105deg,
      ${c} 0%,
      ${c} ${solidEnd}%,
      color-mix(in srgb, ${c} 72%, ${d}) ${mix1}%,
      color-mix(in srgb, ${c} 35%, ${d}) ${mix2}%,
      ${d} ${darkStart}%,
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
