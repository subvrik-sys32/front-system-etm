"use client"

import { useState } from "react"
import { Eye } from "lucide-react"

import { IconAction } from "@/shared/ui/actions/icon-action"
import { DetailAssetsDialog } from "./detail-assets-dialog"

type Props = {
  taskId?: string
  projectId?: string
  readOnly?: boolean
  className?: string
  /** Reservado: resalte futuro si hay assets */
  hasAssets?: boolean
}

/** Mismo chrome que info / editar / borrar (IconAction + CHROME_ICON_BTN). */
export function DetailAssetsEye({
  taskId,
  projectId,
  readOnly,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  if (!taskId && !projectId) return null

  return (
    <>
      <IconAction
        icon={Eye}
        aria-label="Archivos y detalle"
        className={className}
        onClick={() => setOpen(true)}
      />
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
