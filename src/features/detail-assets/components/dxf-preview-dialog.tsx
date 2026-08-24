"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { saveBlobWithPreferences } from "@/features/user-preferences"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogHeaderCloseButton,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { cadParseApi } from "@/features/nesting/api/cad-parse.api"
import type { NestingPieceInput } from "@/features/nesting/components/dxf-canvas/dxf-canvas"
import type { CadRow } from "@/features/nesting/components/piece-list"
import { cadRowToPreviewPieces } from "@/features/nesting/components/piece-preview-dialog"

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
  url: string | null
  fileName?: string | null
}

/**
 * Mismo pipeline que PieceList:
 * cadParseApi.parseFile → CadRow (drawing) → cadRowToPreviewPieces → DxfCanvas
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
        const file = new File([blob], name, { type: "application/dxf" })
        const parsed = await cadParseApi.parseFile(file, ac.signal)
        if (!parsed.valid) throw new Error("Geometría inválida")

        // drawing = espacio completo (mosaico / plano).
        // pieces[0] = fallback una pieza.
        const src = parsed.drawing ?? parsed.pieces?.[0]
        if (!src?.outline?.points?.length) throw new Error("Geometría inválida")

        const row: CadRow = {
          id: "preview",
          source: "cad",
          fileName: name,
          outline: src.outline,
          subEntities: src.subEntities ?? [],
          width: parsed.width ?? 0,
          height: parsed.height ?? 0,
          quantity: "1",
          color: "#22c55e",
          material: { thickness: -1, dinNorm: "N/D", alloy: "N/D" },
        }
        setPieces(cadRowToPreviewPieces(row))
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
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Download size={16} strokeWidth={2} />
            </button>
            <DialogHeaderCloseButton onClick={() => onOpenChange(false)} />
          </div>
        </DialogHeader>
        <div className="relative min-h-0 flex-1 overflow-hidden [&>*]:h-full [&>*]:w-full [&>*]:rounded-none [&>*]:border-0">
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
