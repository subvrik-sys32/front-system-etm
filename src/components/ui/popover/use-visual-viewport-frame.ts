"use client"

import * as React from "react"

export type VisualViewportFrame = {
  top: number
  left: number
  width: number
  height: number
  /** Estimación total del teclado. No usar como padding si el layout ya se achicó. */
  keyboardInset: number
  /**
   * Solo lo que tapa el contenido cuando el layout NO se redujo.
   * Con `interactiveWidget: resizes-content` el layout ya baja → overlayInset = 0
   * (evita el hueco enorme). Si el teclado tapa sin achicar body, eleva el composer
   * (incluye barra superior de accesos iOS/Android).
   */
  overlayInset: number
  keyboardOpen: boolean
}

const KEYBOARD_THRESHOLD_PX = 50

let stableLayoutHeight =
  typeof window !== "undefined" ? window.innerHeight : 0
let stableLayoutWidth =
  typeof window !== "undefined" ? window.innerWidth : 0

function measure(): VisualViewportFrame {
  if (typeof window === "undefined") {
    return {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      keyboardInset: 0,
      overlayInset: 0,
      keyboardOpen: false,
    }
  }

  const layoutH = window.innerHeight
  const layoutW = window.innerWidth

  if (layoutW !== stableLayoutWidth) {
    stableLayoutWidth = layoutW
    stableLayoutHeight = layoutH
  }
  if (layoutH > stableLayoutHeight) {
    stableLayoutHeight = layoutH
  }

  const layoutInset = Math.max(0, Math.round(stableLayoutHeight - layoutH))
  const vv = window.visualViewport
  const covered = vv
    ? Math.max(0, Math.round(layoutH - vv.height - vv.offsetTop))
    : 0
  const keyboardInset = Math.max(layoutInset, covered)
  // Layout ya absorbió el teclado → no paddear.
  // Si no, paddear solo lo que visualmente tapa (barra de accesos incluida).
  const overlayInset =
    layoutInset >= KEYBOARD_THRESHOLD_PX ? 0 : covered

  return {
    top: vv ? Math.round(vv.offsetTop) : 0,
    left: vv ? Math.round(vv.offsetLeft) : 0,
    width: vv ? Math.round(vv.width) : layoutW,
    height: vv ? Math.round(vv.height) : layoutH,
    keyboardInset,
    overlayInset,
    keyboardOpen: keyboardInset >= KEYBOARD_THRESHOLD_PX,
  }
}

/** Viewport frame: popover/sheet + composer (usa overlayInset). */
export function useVisualViewportFrame(): VisualViewportFrame {
  const [frame, setFrame] = React.useState<VisualViewportFrame>(measure)

  React.useEffect(() => {
    let raf = 0
    const tick = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setFrame(measure()))
    }

    tick()
    window.addEventListener("resize", tick)
    window.addEventListener("focusin", tick)
    window.addEventListener("focusout", tick)
    window.visualViewport?.addEventListener("resize", tick)
    window.visualViewport?.addEventListener("scroll", tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", tick)
      window.removeEventListener("focusin", tick)
      window.removeEventListener("focusout", tick)
      window.visualViewport?.removeEventListener("resize", tick)
      window.visualViewport?.removeEventListener("scroll", tick)
    }
  }, [])

  return frame
}
