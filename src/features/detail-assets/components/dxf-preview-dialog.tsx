"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { toast } from "sonner"

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
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = fileName || "plano.dxf"
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      toast.error("No se pudo descargar")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="large"
        className="flex h-[75vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 [&>button]:hidden"
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-3 border-b border-border px-4 py-3">
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
        <div className="relative min-h-0 flex-1 bg-background">
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
            <DxfCanvas pieces={pieces} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
