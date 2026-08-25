"use client"

import * as React from "react"

export type VisualViewportFrame = {
  top: number
  left: number
  width: number
  height: number
  keyboardInset: number
  keyboardOpen: boolean
}

const KEYBOARD_THRESHOLD_PX = 50

function measure(): VisualViewportFrame {
  if (typeof window === "undefined") {
    return {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      keyboardInset: 0,
      keyboardOpen: false,
    }
  }

  const vv = window.visualViewport
  const layoutH = window.innerHeight
  const layoutW = window.innerWidth
  const height = vv ? Math.round(vv.height) : layoutH
  const width = vv ? Math.round(vv.width) : layoutW
  const top = vv ? Math.round(vv.offsetTop) : 0
  const left = vv ? Math.round(vv.offsetLeft) : 0
  const keyboardInset = Math.max(0, Math.round(layoutH - height))

  return {
    top,
    left,
    width,
    height,
    keyboardInset,
    keyboardOpen: keyboardInset >= KEYBOARD_THRESHOLD_PX,
  }
}

/**
 * Hueco visible + teclado. Con resizes-visual el layout no se achica;
 * visualViewport sí. Un solo medidor para sheet y dialog large.
 */
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
