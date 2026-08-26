export function getFinishMaterialSurface(finishHex: string): string {
  const c = finishHex.trim() || "#64748B"

  // Transición centrada en el badge (mockup): color sólido ~0–32%,
  // fundido ~32–55%, oscuro el resto. Antes el fundido iba 15–45%
  // y se veía corrido a la izquierda.
  return [
    `linear-gradient(
      105deg,
      ${c} 0%,
      ${c} 32%,
      color-mix(in srgb, ${c} 65%, #17191d) 42%,
      color-mix(in srgb, ${c} 28%, #17191d) 52%,
      #17191d 58%,
      #17191d 100%
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