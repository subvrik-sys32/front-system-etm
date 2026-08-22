"use client"

import { useRef, useState } from "react"
import { Eye, FileUp, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/shared/utils/utils"
import { detailAssetsApi } from "@/features/detail-assets/api/detail-assets.api"
import type { DetailAsset } from "@/features/detail-assets/types"

type Props = {
  /** Id real de TaskMaterialLine (solo tras guardar la tarea). */
  lineId?: string
  /** DXF ya persistido (include del task). */
  dxf?: DetailAsset | null
  disabled?: boolean
  onChanged?: () => void
}

/**
 * Subir / ver / borrar DXF de una línea de material.
 * Sin lineId: muestra hint "Guardá la tarea para adjuntar DXF".
 */
export function MaterialLineDxfControls({
  lineId,
  dxf,
  disabled,
  onChanged,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const upload = async (file: File) => {
    if (!lineId) {
      toast.message("Guardá la tarea primero para adjuntar el DXF")
      return
    }
    if (!file.name.toLowerCase().endsWith(".dxf")) {
      toast.error("Solo archivos .dxf")
      return
    }
    setBusy(true)
    try {
      await detailAssetsApi.uploadMaterialLineDxf(lineId, file)
      toast.success("DXF adjuntado")
      onChanged?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir el DXF")
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!dxf?.id) return
    setBusy(true)
    try {
      await detailAssetsApi.remove(dxf.id)
      toast.success("DXF eliminado")
      onChanged?.()
    } catch {
      toast.error("No se pudo eliminar")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".dxf,application/dxf"
        className="hidden"
        disabled={disabled || busy || !lineId}
        onChange={e => {
          const f = e.target.files?.[0]
          e.target.value = ""
          if (f) void upload(f)
        }}
      />
      <button
        type="button"
        title={lineId ? "Subir DXF" : "Guardá la tarea para adjuntar DXF"}
        disabled={disabled || busy || !lineId}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition",
          "hover:bg-foreground/10 hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
      </button>
      {dxf?.publicUrl ? (
        <>
          <a
            href={dxf.publicUrl}
            target="_blank"
            rel="noreferrer"
            title={dxf.originalName || "Ver DXF"}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
          >
            <Eye size={14} />
          </a>
          <button
            type="button"
            title="Quitar DXF"
            disabled={disabled || busy}
            onClick={() => void remove()}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </>
      ) : null}
    </div>
  )
}
