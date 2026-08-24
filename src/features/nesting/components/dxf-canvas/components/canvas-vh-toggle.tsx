"use client"

import { Hand, MousePointer2 } from "lucide-react"
import type { CanvasTool } from "../types/types"
import { RULER_SIZE } from "../utils/draw/draw-rulers"
import { cn } from "@/shared/utils/utils"

type Props = {
  canvasTool: CanvasTool
  onChange: (tool: CanvasTool) => void
  isCompact: boolean
  isMobile: boolean
  toolsChromeOpen: boolean
}

export function CanvasVhToggle({
  canvasTool,
  onChange,
  isCompact,
  isMobile,
  toolsChromeOpen,
}: Props) {
  return (
    <div
      data-slot="canvas-vh"
      className="pointer-events-none absolute right-3 z-20 flex items-center gap-1.5 transition-[top] duration-300"
      style={{
        top: toolsChromeOpen && isMobile ? RULER_SIZE + 88 : RULER_SIZE + 8,
      }}
    >
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full bg-muted/90 p-1 backdrop-blur-sm">
        <button
          type="button"
          title="Seleccionar (V)"
          onClick={() => onChange("select")}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-full text-[11px] font-semibold transition-colors",
            isCompact ? "w-8 justify-center px-0" : "px-2.5",
            canvasTool === "select"
              ? "bg-foreground/15 text-foreground"
              : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          <MousePointer2 className="h-3.5 w-3.5" />
          {!isCompact && "V"}
        </button>
        <button
          type="button"
          title="Pan (H)"
          onClick={() => onChange("pan")}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-full text-[11px] font-semibold transition-colors",
            isCompact ? "w-8 justify-center px-0" : "px-2.5",
            canvasTool === "pan"
              ? "bg-foreground/15 text-foreground"
              : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          <Hand className="h-3.5 w-3.5" />
          {!isCompact && "H"}
        </button>
      </div>
    </div>
  )
}