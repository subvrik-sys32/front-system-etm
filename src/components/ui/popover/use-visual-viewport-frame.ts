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

  const keyboardInset = Math.max(0, Math.round(stableLayoutHeight - layoutH))

  return {
    top: 0,
    left: 0,
    width: layoutW,
    height: layoutH,
    keyboardInset,
    keyboardOpen: keyboardInset >= KEYBOARD_THRESHOLD_PX,
  }
}

/** Solo el sheet (Vaul): ¿hay teclado? El dialog large no usa esto. */
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

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", tick)
      window.removeEventListener("focusin", tick)
      window.removeEventListener("focusout", tick)
    }
  }, [])

  return frame
}
