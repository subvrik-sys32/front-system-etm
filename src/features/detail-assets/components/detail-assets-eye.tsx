"use client"

import { useState } from "react"
import { Eye } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { DetailAssetsDialog } from "./detail-assets-dialog"

type Props = {
  taskId?: string
  projectId?: string
  readOnly?: boolean
  className?: string
  hasAssets?: boolean
}

export function DetailAssetsEye({
  taskId,
  projectId,
  readOnly,
  className,
  hasAssets,
}: Props) {
  const [open, setOpen] = useState(false)
  if (!taskId && !projectId) return null

  return (
    <>
      <button
        type="button"
        title="Archivos y detalle"
        onClick={e => {
          e.stopPropagation()
          setOpen(true)
        }}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition",
          "hover:bg-foreground/10 hover:text-foreground",
          hasAssets && "text-sky-400",
          className,
        )}
      >
        <Eye size={15} strokeWidth={2} />
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
