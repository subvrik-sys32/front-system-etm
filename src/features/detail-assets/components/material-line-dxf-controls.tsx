"use client"

import { useRef, useState } from "react"
import { Download, Eye, FilePenLine, FileUp, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { saveBlobWithPreferences } from "@/features/user-preferences"
import { useQueryClient } from "@tanstack/react-query"

import { Spinner } from "@/shared/ui/spinner/spinner"
import { cn } from "@/shared/utils/utils"
import { detailAssetsApi } from "@/features/detail-assets/api/detail-assets.api"
import type { DetailAsset } from "@/features/detail-assets/types"
import { invalidateDetailAssetCaches } from "@/features/detail-assets/hooks/use-detail-assets"
import { DxfPreviewDialog } from "./dxf-preview-dialog"

type Props = {
  lineId?: string | null
  taskId?: string | null
  dxf?: DetailAsset | null
  pendingFile?: File | null
  onPendingFile?: (file: File | null) => void
  /** Notifica al form padre tras subir/quitar (invalidar cache local). */
  onChanged?: () => void
  disabled?: boolean
  className?: string
}

const btn =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"

/**
 * Subir / ver (visor nesting) / descargar / quitar DXF de una línea de material.
 * Icono dinámico: FileUp (importar) si no hay DXF; FilePenLine (editable) si hay.
 */
export function MaterialLineDxfControls({
  lineId,
  taskId,
  dxf,
  pendingFile,
  onPendingFile,
  onChanged,
  disabled,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const hasDxf = Boolean(dxf?.publicUrl) || Boolean(pendingFile)
  const displayName = dxf?.originalName || pendingFile?.name || "plano.dxf"

  async function upload(file: File) {
    if (!file.name.toLowerCase().endsWith(".dxf")) {
      toast.error("Solo archivos .dxf")
      return
    }
    if (!lineId) {
      onPendingFile?.(file)
      toast.success(`DXF listo: ${file.name}`)
      return
    }
    setBusy(true)
    try {
      await detailAssetsApi.uploadMaterialLineDxf(lineId, file)
      invalidateDetailAssetCaches(qc, { taskId: taskId ?? undefined })
      toast.success(`DXF guardado: ${file.name}`)
      onChanged?.()
    } catch {
      toast.error("No se pudo subir el DXF")
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (pendingFile && !dxf?.id) {
      onPendingFile?.(null)
      return
    }
    if (!dxf?.id) return
    setBusy(true)
    try {
      await detailAssetsApi.remove(dxf.id)
      invalidateDetailAssetCaches(qc, { taskId: taskId ?? undefined })
      toast.success("DXF eliminado")
      onChanged?.()
    } catch {
      toast.error("No se pudo eliminar")
    } finally {
      setBusy(false)
    }
  }

  async function download() {
    try {
      if (pendingFile) {
        await saveBlobWithPreferences({
          blob: pendingFile,
          fileName: pendingFile.name,
          mimeType: "application/dxf",
        })
        return
      }
      if (!dxf?.publicUrl) return
      const res = await fetch(dxf.publicUrl)
      if (!res.ok) throw new Error("fetch")
      const blob = await res.blob()
      await saveBlobWithPreferences({
        blob,
        fileName: dxf.originalName || "plano.dxf",
        mimeType: "application/dxf",
      })
    } catch {
      toast.error("No se pudo descargar")
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <input
        ref={inputRef}
        type="file"
        accept=".dxf,application/dxf,application/octet-stream,text/plain"
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
        title={
          hasDxf
            ? "Reemplazar DXF"
            : lineId
              ? "Subir DXF"
              : "Elegir DXF (se sube al guardar)"
        }
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={btn}
      >
        {busy ? (
          <Spinner size={15} />
        ) : hasDxf ? (
          <FilePenLine size={15} strokeWidth={2} />
        ) : (
          <FileUp size={15} strokeWidth={2} />
        )}
      </button>
      {hasDxf && (
        <>
          {dxf?.publicUrl ? (
            <button
              type="button"
              title={`Ver ${displayName}`}
              className={btn}
              onClick={() => setPreviewOpen(true)}
            >
              <Eye size={15} strokeWidth={2} />
            </button>
          ) : pendingFile ? (
            <span
              title={pendingFile.name}
              className={cn(btn, "cursor-default text-sky-400")}
            >
              <Eye size={15} strokeWidth={2} />
            </span>
          ) : null}
          <button
            type="button"
            title="Descargar DXF"
            disabled={busy}
            onClick={() => void download()}
            className={btn}
          >
            <Download size={15} strokeWidth={2} />
          </button>
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
      <DxfPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        url={dxf?.publicUrl ?? null}
        fileName={displayName}
      />
    </div>
  )
}