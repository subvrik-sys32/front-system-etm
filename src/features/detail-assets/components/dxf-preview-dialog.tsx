"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { toast } from "sonner"
import { saveBlobWithPreferences } from "@/features/user-preferences"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { cadParseApi } from "@/features/nesting/api/cad-parse.api"
import type { NestingPieceInput } from "@/features/nesting/components/dxf-canvas/dxf-canvas"

const DxfCanvas = dynamic(
  () =>
    import("@/features/nesting/components/dxf-canvas/dxf-canvas").then(
      m => m.DxfCanvas,
    ),
  { ssr: false },
)

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** URL pública del DXF */
  url: string | null
  fileName?: string | null
}

/**
 * Visor DXF = mismo canvas que nesting (solo lectura).
 * Descarga aparte del ojito.
 */
export function DxfPreviewDialog({
  open,
  onOpenChange,
  url,
  fileName,
}: Props) {
  const [pieces, setPieces] = useState<NestingPieceInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !url) {
      setPieces([])
      setError(null)
      return
    }
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await fetch(url, { signal: ac.signal })
        if (!res.ok) throw new Error("No se pudo descargar el DXF")
        const blob = await res.blob()
        const name = fileName?.endsWith(".dxf")
          ? fileName
          : `${fileName || "plano"}.dxf`
        const file = new File([blob], name, {
          type: "application/dxf",
        })
        const parsed = await cadParseApi.parseFile(file, ac.signal)
        if (!parsed.valid || !parsed.pieces?.length) {
          throw new Error("Geometría inválida")
        }
        setPieces(
          parsed.pieces.map(p => ({
            outline: p.outline.points,
            subOutlines: (p.subEntities ?? []).map(s => ({
              points: s.outline.points,
              color: s.color,
            })),
          })),
        )
      } catch (e) {
        if ((e as Error).name === "AbortError") return
        setError((e as Error).message || "Error al cargar DXF")
        setPieces([])
      } finally {
        setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [open, url, fileName])

  const handleDownload = async () => {
    if (!url) return
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      await saveBlobWithPreferences({
        blob,
        fileName: fileName || "plano.dxf",
        mimeType: "application/dxf",
      })
    } catch {
      toast.error("No se pudo descargar")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="large"
        className="flex h-[75vh] w-full max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xs [&>button]:hidden"
      >
        <DialogHeader className="z-20 flex shrink-0 flex-row items-center justify-between gap-3 border-b border-border/60 bg-popover px-4 py-3">
          <DialogTitle className="min-w-0 truncate text-sm font-semibold">
            {fileName || "Plano DXF"}
          </DialogTitle>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              title="Descargar"
              onClick={() => void handleDownload()}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
            >
              <Download size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              title="Cerrar"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </DialogHeader>
        {/* Lienzo a sangre: sin padding ni rounded interno (el dialog ya recorta) */}
        <div
          className={
            "relative min-h-0 flex-1 overflow-hidden bg-neutral-950 " +
            // anula rounded/borde del DxfCanvas anidado
            "[&>*]:h-full [&>*]:w-full [&>*]:rounded-none [&>*]:border-0"
          }
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <Spinner size={28} />
            </div>
          )}
          {error && (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              {error}
            </div>
          )}
          {!loading && !error && pieces.length > 0 && (
            <DxfCanvas pieces={pieces} className="h-full w-full rounded-none border-0" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
