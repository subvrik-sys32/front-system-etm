/**
 * Tras cerrar un sheet/dial por pointerdown en el overlay, el overlay
 * pierde pointer-events y el mismo gesto genera click/touchend en lo
 * de detrás. Listeners sueltos fallan en iOS; un shield DOM captura
 * el resto del gesto y se auto-elimina.
 */
export function suppressDismissClickThrough(ms = 400) {
  if (typeof document === "undefined") return

  const existing = document.querySelector("[data-dismiss-click-shield]")
  if (existing) existing.remove()

  const shield = document.createElement("div")
  shield.setAttribute("data-dismiss-click-shield", "")
  Object.assign(shield.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483646",
    touchAction: "none",
    cursor: "default",
  })

  const stop = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
  }

  for (const type of [
    "pointerdown",
    "pointerup",
    "pointercancel",
    "touchstart",
    "touchend",
    "touchcancel",
    "mousedown",
    "mouseup",
    "click",
  ] as const) {
    shield.addEventListener(type, stop, true)
  }

  document.body.appendChild(shield)
  window.setTimeout(() => {
    shield.remove()
  }, ms)
}
