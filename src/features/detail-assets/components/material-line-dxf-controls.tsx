"use client"

import { useRef, useState } from "react"
import { Eye, FileUp, Trash2 } from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { toast } from "sonner"

import { cn } from "@/shared/utils/utils"
import { detailAssetsApi } from "@/features/detail-assets/api/detail-assets.api"
import type { DetailAsset } from "@/features/detail-assets/types"

type Props = {
  lineId?: string
  dxf?: DetailAsset | null
  pendingFile?: File | null
  disabled?: boolean
  onChanged?: () => void
  onPendingFile?: (file: File | null) => void
}

/** Misma caja size-9 que el botón borrar de la fila. */
export function MaterialLineDxfControls({
  lineId,
  dxf,
  pendingFile,
  disabled,
  onChanged,
  onPendingFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const hasDxf = Boolean(dxf?.publicUrl) || Boolean(pendingFile)

  const upload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".dxf")) {
      toast.error("Solo archivos .dxf")
      return
    }
    if (!lineId) {
      onPendingFile?.(file)
      toast.message("DXF listo — se subirá al guardar la tarea")
      return
    }
    setBusy(true)
    try {
      await detailAssetsApi.uploadMaterialLineDxf(lineId, file)
      toast.success("DXF adjuntado")
      onPendingFile?.(null)
      onChanged?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir el DXF")
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (pendingFile && !dxf?.id) {
      onPendingFile?.(null)
      return
    }
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

  const btn =
    "flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <input
        ref={inputRef}
        type="file"
        accept=".dxf,application/dxf"
        className="hidden"
        disabled={disabled || busy}
        onChange={e => {
          const f = e.target.files?.[0]
          e.target.value = ""
          if (f) void upload(f)
        }}
      />
      <button
        type="button"
        title={lineId ? "Subir DXF" : "Elegir DXF (se sube al guardar)"}
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={btn}
      >
        {busy ? (
          <Spinner size={15} />
        ) : (
          <FileUp size={15} strokeWidth={2} />
        )}
      </button>
      {hasDxf && (
        <>
          {dxf?.publicUrl ? (
            <a
              href={dxf.publicUrl}
              target="_blank"
              rel="noreferrer"
              title={dxf.originalName || "Ver DXF"}
              className={btn}
            >
              <Eye size={15} strokeWidth={2} />
            </a>
          ) : pendingFile ? (
            <span title={pendingFile.name} className={cn(btn, "cursor-default text-sky-400")}>
              <Eye size={15} strokeWidth={2} />
            </span>
          ) : null}
          <button
            type="button"
            title="Quitar DXF"
            disabled={disabled || busy}
            onClick={() => void remove()}
            className={cn(btn, "hover:bg-red-500/15 hover:text-red-500")}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </>
      )}
    </div>
  )
}
