"use client"

import { Ruler, Trash2, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RULER_SIZE } from "../utils/draw/draw-rulers"
import { fmtMm } from "../utils/geometry-utils"
import type { Measurement } from "../types/types"

type Props = {
  measurements: Measurement[]
  onClear: () => void
  onRemove: (id: string) => void
}

export function CanvasMeasurePanel({ measurements, onClear, onRemove }: Props) {
  if (measurements.length === 0) return null

  return (
    <div
      className="absolute bottom-14 z-30 flex max-h-[40%] w-[min(15rem,calc(100%-1.5rem))] flex-col gap-1.5 rounded-2xl bg-popover/95 p-2.5 backdrop-blur-md sm:p-3"
      style={{ left: RULER_SIZE + 8 }}
      title="Mediciones activas"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-0.5 pb-0.5">
        <span className="hidden min-w-0 truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
          Mediciones
        </span>
        <span className="inline text-muted-foreground sm:hidden" aria-hidden>
          <Ruler size={14} />
        </span>
        <div className="flex items-center gap-1">
          <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
            {measurements.length}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
            title="Borrar todas"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 pt-0.5 pr-1">
          {measurements.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-foreground/5 px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-foreground/10"
            >
              <span className="min-w-0 truncate font-medium">
                {m.kind === "distance" && fmtMm(m.value)}
                {m.kind === "radius" &&
                  `R${m.radius.toFixed(1)} · ⌀${(m.radius * 2).toFixed(1)}`}
                {m.kind === "angle" && `${m.degrees.toFixed(1)}°`}
                {m.kind === "area" && `${(m.area / 1_000_000).toFixed(4)}m²`}
              </span>
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="shrink-0 rounded-lg p-1 text-foreground/70 transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}