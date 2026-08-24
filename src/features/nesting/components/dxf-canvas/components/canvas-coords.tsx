"use client"

import { type RefObject } from "react"

type Props = {
  labelRef: RefObject<HTMLSpanElement | null>
}

export function CanvasCoords({ labelRef }: Props) {
  return (
    <div
      data-slot="canvas-coords"
      className="pointer-events-none absolute bottom-3 z-20 rounded-full bg-muted/90 px-3 py-1.5 text-[11px] tabular-nums text-muted-foreground backdrop-blur-sm"
      style={{ right: 12 }}
    >
      <span ref={labelRef}>X: —  Y: — mm</span>
    </div>
  )
}