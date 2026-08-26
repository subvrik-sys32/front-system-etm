/**
 * Superficie continua para badges industriales.
 *
 * El color RAL domina el inicio del badge y se desvanece
 * progresivamente hacia la superficie oscura del ERP.
 */
export function getFinishMaterialSurface(finishHex: string): string {
  const c = finishHex.trim() || "#64748B"

  return [
    `linear-gradient(
      105deg,
      ${c} 0%,
      ${c} 20%,
      color-mix(in srgb, ${c} 60%, #17191d) 32%,
      color-mix(in srgb, ${c} 20%, #17191d) 40%,
      #17191d 48%,
      #17191d 100%
    )`,
    `linear-gradient(
      180deg,
      rgba(255,255,255,0.07) 0%,
      rgba(255,255,255,0.015) 45%,
      rgba(0,0,0,0.08) 100%
    )`,
  ]
    .join(", ")
    .replace(/\s+/g, " ")
    .trim()
}