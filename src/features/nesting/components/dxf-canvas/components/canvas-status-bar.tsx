"use client"

import { useEffect, useState } from "react"
import { CircleSlash, HelpCircle, Trash2 } from "lucide-react"
import { RULER_SIZE } from "../utils/draw/draw-rulers"
import { cn } from "@/shared/utils/utils"

type Props = {
  isCompact: boolean
  selectedCount: number
  collidingCount: number
  rotationStep: number
  canvasTool: string
  onDeselect: () => void
  onDelete?: () => void
  onRotate?: (deg: number) => void
  onFreeRotate: () => void
  canDelete: boolean
  canRotate: boolean
}

export function CanvasStatusBar({
  isCompact,
  selectedCount,
  collidingCount,
  rotationStep,
  canvasTool,
  onDeselect,
  onDelete,
  onRotate,
  onFreeRotate,
  canDelete,
  canRotate,
}: Props) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const hasSelection = selectedCount > 0

  useEffect(() => {
    setActionsOpen(hasSelection)
  }, [hasSelection])

  useEffect(() => {
    if (!helpOpen) return
    const t = setTimeout(() => setHelpOpen(false), 9000)
    return () => clearTimeout(t)
  }, [helpOpen])

  return (
    <div
      data-slot="canvas-status-bar"
      className={cn(
        "absolute bottom-3 z-20 flex items-center gap-2 rounded-full bg-muted/95 py-1.5 text-xs text-muted-foreground backdrop-blur-sm",
        isCompact ? "px-2.5" : "px-3",
      )}
      style={{ left: RULER_SIZE + 8 }}
    >
      {hasSelection ? (
        <button
          type="button"
          onClick={() => setActionsOpen((v) => !v)}
          className="min-w-22 text-left text-foreground hover:text-foreground"
          aria-expanded={actionsOpen}
          title={actionsOpen ? "Ocultar acciones" : "Ver acciones"}
        >
          {selectedCount === 1 ? "1 pieza" : `${selectedCount} piezas`}
        </button>
      ) : (
        <span className="min-w-22 text-foreground">Sin selección</span>
      )}

      {collidingCount > 0 && (
        <>
          <span className="text-foreground/15">|</span>
          <span className="font-medium text-red-400">
            {collidingCount} colisión{collidingCount === 1 ? "" : "es"}
          </span>
        </>
      )}

      {hasSelection && (
        <div
          className={cn(
            "flex items-center gap-0.5 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            actionsOpen
              ? "max-w-80 opacity-100"
              : "pointer-events-none max-w-0 opacity-0",
          )}
        >
          <span className="text-foreground/15">|</span>
          <button
            type="button"
            onClick={onDeselect}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            title="Deseleccionar"
          >
            <CircleSlash size={13} />
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={onDelete}
            className="rounded-full p-1.5 text-destructive hover:bg-destructive/15 disabled:pointer-events-none disabled:opacity-30"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
          <div className="mx-0.5 h-4 w-px shrink-0 bg-foreground/10" />
          <button
            type="button"
            disabled={!canRotate}
            onClick={() => onRotate?.(rotationStep)}
            className="whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            +{rotationStep}°
          </button>
          <button
            type="button"
            disabled={!canRotate}
            onClick={() => onRotate?.(-rotationStep)}
            className="whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            −{rotationStep}°
          </button>
          <button
            type="button"
            onClick={onFreeRotate}
            className={cn(
              "whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium hover:bg-foreground/10 hover:text-foreground",
              canvasTool === "rotate"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground",
            )}
            title="Rotar libre arrastrando (Shift = pasos de 15°)"
          >
            Libre
          </button>
        </div>
      )}

      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setHelpOpen((p) => !p)}
          className="ml-1 rounded-full p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          title="Ayuda de atajos"
        >
          <HelpCircle size={13} />
        </button>
        {helpOpen && (
          <div
            className={
              isCompact
                ? "fixed inset-x-3 bottom-16 z-40 rounded-xl bg-popover/95 p-3 text-[11px] text-muted-foreground backdrop-blur-md"
                : "absolute bottom-8 left-0 z-40 w-60 rounded-xl bg-popover/95 p-3 text-[11px] text-muted-foreground backdrop-blur-md"
            }
          >
            <div className="z-90 mb-1 font-semibold text-foreground">
              Guía rápida de interacción:
            </div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                • <strong className="text-foreground">V</strong>: Modo Selección
              </li>
              <li>
                • <strong className="text-foreground">H o Espacio+Arrastrar</strong>:
                Panorámica
              </li>
              <li>
                • <strong className="text-foreground">Arrastrar fondo</strong>:
                Selección por caja
              </li>
              <li>
                • <strong className="text-foreground">Anticlick</strong>: Salir de
                herramienta actual
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}