export function getFinishMaterialSurface(finishHex: string, shift: number = 0): string {
  const c = finishHex.trim() || "#64748B"

  // Rango más estrecho/pequeño (la transición total pasa de abarcar ~26% a solo ~12%)
  const b1 = 32 + shift
  const b2 = 36 + shift // Inicio rápido de la mezcla
  const b3 = 40 + shift // Sigue oscureciendo rápido
  const b4 = 44 + shift // Negro total más cerca

  return [
    `linear-gradient(
      105deg,
      ${c} 0%,
      ${c} ${b1}%,
      color-mix(in srgb, ${c} 65%, #17191d) ${b2}%,
      color-mix(in srgb, ${c} 28%, #17191d) ${b3}%,
      #17191d ${b4}%,
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