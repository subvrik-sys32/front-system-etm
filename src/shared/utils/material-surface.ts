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
      112deg,
      ${c} 0%,
      ${c} 18%,
      color-mix(in srgb, ${c} 94%, #17191d) 27%,
      color-mix(in srgb, ${c} 72%, #17191d) 38%,
      color-mix(in srgb, ${c} 46%, #17191d) 49%,
      color-mix(in srgb, ${c} 24%, #20242a) 58%,
      #20242a 68%,
      #17191d 82%
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