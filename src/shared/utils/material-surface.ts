export function getFinishMaterialSurface(finishHex: string): string {
  const c = finishHex.trim() || "#64748B"

  return [
    `linear-gradient(
      105deg,
      ${c} 0%,
      ${c} 15%,
      color-mix(in srgb, ${c} 70%, #17191d) 25%,
      color-mix(in srgb, ${c} 30%, #17191d) 35%,
      #17191d 45%,
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