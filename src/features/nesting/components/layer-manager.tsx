"use client"

import { useState } from "react"
import { ChevronRight, Layers, Eye, EyeOff } from "lucide-react"
import type { LayerInfo } from "./dxf-canvas/dxf-canvas"

export interface LayerManagerProps {
  layers: LayerInfo[]
  hiddenKeys: Set<string>
  onToggle: (key: string) => void
  onShowAll: () => void
}

export function LayerManager({ layers, hiddenKeys, onToggle, onShowAll }: LayerManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (layers.length === 0) {
    return (
      <div className="px-2 py-4 text-center text-xs text-muted-foreground">
        Nesteá primero para ver las capas de la plancha activa.
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-foreground/5"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Layers className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Capas ({layers.length})
          </span>
        </span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </button>

      <div
        className={`flex flex-col overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "mt-1 max-h-150 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col px-2 pb-2">
          {hiddenKeys.size > 0 && (
            <button
              type="button"
              onClick={onShowAll}
              className="mb-1 self-start px-1 py-1 text-[10px] font-medium text-primary"
            >
              Mostrar todas
            </button>
          )}
          {layers.map(layer => {
            const isHidden = hiddenKeys.has(layer.key.toUpperCase())
            return (
              <button
                key={layer.key}
                type="button"
                onClick={() => onToggle(layer.key)}
                className={`flex items-center justify-between gap-2 px-1 py-1.5 text-left text-xs transition-colors ${
                  isHidden ? "text-muted-foreground/80" : "text-foreground hover:bg-foreground/5"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: layer.color, opacity: isHidden ? 0.3 : 1 }}
                />
                <span className="min-w-0 flex-1 truncate" title={layer.label}>
                  {layer.label}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground/80">{layer.count}</span>
                {isHidden ? (
                  <EyeOff className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
