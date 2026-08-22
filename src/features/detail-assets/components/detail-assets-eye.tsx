"use client"

import { useState } from "react"
import { Eye } from "lucide-react"

import { CHROME_ICON_BTN } from "@/shared/ui/actions/icon-action"
import { cn } from "@/shared/utils/utils"
import {
  useProjectDetailAssets,
  useTaskDetailAssets,
} from "../hooks/use-detail-assets"
import type { TaskDetailAssetsResponse } from "../types"
import { DetailAssetsDialog } from "./detail-assets-dialog"

type Props = {
  taskId?: string
  projectId?: string
  readOnly?: boolean
  className?: string
  /** Si el padre ya sabe el total, evita query (opcional). */
  count?: number
  /** @deprecated Prefer count; se acepta por compat con rows. */
  hasAssets?: boolean
}

function countTaskAssets(data: TaskDetailAssetsResponse | undefined): number {
  if (!data) return 0
  const photosNotes = data.taskAssets?.length ?? 0
  const dxfs = data.materialLines?.filter(l => l.dxf).length ?? 0
  return photosNotes + dxfs
}

/**
 * Ojo de archivos/detalle — mismo chrome que materiales, con contador.
 */
export function DetailAssetsEye({
  taskId,
  projectId,
  readOnly,
  className,
  count: countProp,
  hasAssets,
}: Props) {
  const [open, setOpen] = useState(false)
  const taskQ = useTaskDetailAssets(taskId, countProp === undefined && Boolean(taskId))
  const projectQ = useProjectDetailAssets(
    projectId,
    countProp === undefined && Boolean(projectId) && !taskId,
  )

  void hasAssets
  if (!taskId && !projectId) return null

  const count =
    countProp !== undefined
      ? countProp
      : taskId
        ? countTaskAssets(taskQ.data)
        : (projectQ.data?.length ?? 0)

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
      />
    </>
  )
}
