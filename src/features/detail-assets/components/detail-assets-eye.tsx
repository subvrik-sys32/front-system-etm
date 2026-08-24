"use client"

import { useState } from "react"
import { Eye } from "lucide-react"

import { CHROME_ICON_BTN } from "@/shared/ui/actions/icon-action"
import { cn } from "@/shared/utils/utils"
import { DetailAssetsDialog } from "./detail-assets-dialog"

type Props = {
  taskId?: string
  projectId?: string
  readOnly?: boolean
  className?: string
  /**
   * Contador del listado (SSOT del badge).
   * NO se hace GET por fila: el dialog carga al abrir.
   */
  count?: number
  /** @deprecated Prefer `count`. */
  hasAssets?: boolean
  /** Solo tareas: abre TaskDialog para editar líneas de material. */
  onEditTask?: () => void
}

/**
 * Ojo de archivos/detalle en filas.
 * Sin N+1: el badge usa `count` del padre; los datos se piden
 * solo cuando el dialog abre.
 */
export function DetailAssetsEye({
  taskId,
  projectId,
  readOnly,
  className,
  count: countProp,
  hasAssets,
  onEditTask,
}: Props) {
  const [open, setOpen] = useState(false)

  if (!taskId && !projectId) return null

  const count = countProp !== undefined ? countProp : hasAssets ? 1 : 0

  return (
    <>
      <button
        type="button"
        aria-label={
          count > 0
            ? `Archivos y detalle (${count})`
            : "Archivos y detalle"
        }
        title="Archivos y detalle"
        onPointerDown={e => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        className={cn(CHROME_ICON_BTN, "relative", className)}
      >
        <Eye size={14} strokeWidth={2.25} />
        {count > 0 && (
          <span
            className={cn(
              "absolute -right-1 -top-1 flex size-3.5 items-center justify-center",
              "rounded-full bg-primary text-[8px] font-bold tabular-nums text-primary-foreground",
            )}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      <DetailAssetsDialog
        open={open}
        onOpenChange={setOpen}
        taskId={taskId}
        projectId={projectId}
        readOnly={readOnly}
        onEditTask={onEditTask}
      />
    </>
  )
}