"use client"

import { useRef, useState } from "react"
import { Download, Eye, ImagePlus, MessageSquare, Trash2 } from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { toast } from "sonner"
import { saveBlobWithPreferences } from "@/features/user-preferences"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { FormDialogHeader } from "@/shared/ui/dialogs/form-dialog/form-dialog-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/shared/utils/utils"

import {
  useDetailAssetMutations,
  useProjectDetailAssets,
  useTaskDetailAssets,
} from "../hooks/use-detail-assets"
import type { DetailAsset } from "../types"
import { DxfPreviewDialog } from "./dxf-preview-dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId?: string
  projectId?: string
  /** Process / historial: no subir, solo ver. */
  readOnly?: boolean
}

export function DetailAssetsDialog({
  open,
  onOpenChange,
  taskId,
  projectId,
  readOnly = false,
}: Props) {
  const isTask = Boolean(taskId)
  const taskQ = useTaskDetailAssets(taskId, open && isTask)
  const projectQ = useProjectDetailAssets(projectId, open && !isTask)
  const mutations = useDetailAssetMutations({ taskId, projectId })

  const fileRef = useRef<HTMLInputElement>(null)
  const [previewDxf, setPreviewDxf] = useState<{ url: string; name: string } | null>(null)
  const [note, setNote] = useState("")

  const photos: DetailAsset[] = isTask
    ? (taskQ.data?.taskAssets.filter(a => a.kind === "PHOTO") ?? [])
    : (projectQ.data.filter(a => a.kind === "PHOTO") ?? [])
  const noteAsset: DetailAsset | undefined = isTask
    ? taskQ.data?.taskAssets.find(a => a.kind === "NOTE")
    : projectQ.data.find(a => a.kind === "NOTE")
  const materialLines = taskQ.data?.materialLines ?? []

  const loading = isTask ? taskQ.loading : projectQ.loading

  // sync note when loads
  const noteText =
    note ||
    (typeof noteAsset?.meta === "object" && noteAsset?.meta && "text" in noteAsset.meta
      ? String((noteAsset.meta as { text?: string }).text ?? "")
      : "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="large"
        className="flex max-h-[min(92dvh,100%)] flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xs"
      >
        <FormDialogHeader
          title="Archivos y detalle"
          icon={MessageSquare}
        />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 px-4 py-3">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner size={20} className="text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Fotos: en solo lectura no mostrar bloque vacío */}
                {(!readOnly || photos.length > 0) && (
                <section className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Fotos ({photos.length}/2)
                    </h3>
                    {!readOnly && photos.length < 2 && (
                      <>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0]
                            e.target.value = ""
                            if (!f) return
                            mutations.uploadPhoto.mutate(f, {
                              onSuccess: () => toast.success("Foto subida"),
                              onError: () => toast.error("No se pudo subir"),
                            })
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                        >
                          <ImagePlus size={14} /> Añadir
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {photos.map(p => (
                      <div
                        key={p.id}
                        className="group relative size-20 overflow-hidden rounded-xl bg-muted/50"
                      >
                        {p.publicUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.publicUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : null}
                        {!readOnly && (
                          <button
                            type="button"
                            title="Eliminar foto"
                            onClick={() => mutations.remove.mutate(p.id)}
                            className="absolute right-1.5 top-1.5 rounded-lg bg-background/90 p-1.5 text-muted-foreground shadow-xs backdrop-blur-xs transition hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {photos.length === 0 && !readOnly && (
                      <p className="text-xs text-muted-foreground">Sin fotos</p>
                    )}
                  </div>
                </section>
                )}

                {/* Nota: en solo lectura no se muestra si está vacía */}
                {(!readOnly || Boolean((note || noteText).trim())) && (
                  <section className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nota
                    </h3>
                    {readOnly ? (
                      <p className="rounded-xl bg-foreground/5 px-3 py-2 text-sm whitespace-pre-wrap">
                        {(note || noteText).trim()}
                      </p>
                    ) : (
                      <>
                        <textarea
                          value={note || noteText}
                          onChange={e => setNote(e.target.value)}
                          rows={3}
                          placeholder="Detalle libre..."
                          className="w-full resize-none rounded-xl bg-foreground/5 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            mutations.saveNote.mutate(note || noteText, {
                              onSuccess: () => toast.success("Nota guardada"),
                            })
                          }
                          className="self-end rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-semibold"
                        >
                          Guardar nota
                        </button>
                      </>
                    )}
                  </section>
                )}

                {/* DXF por material (solo tarea) */}
                {isTask && (
                  <section className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Planos DXF por material
                    </h3>
                    {materialLines.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sin líneas de material</p>
                    ) : (
                      materialLines.map(line => (
                        <div
                          key={line.id}
                          className="flex items-center gap-2 rounded-xl bg-foreground/5 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {line.material.name} · {line.thickness.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {line.pieces} pzs
                              {line.dxf ? ` · ${line.dxf.originalName}` : " · sin DXF"}
                            </p>
                          </div>
                          {line.dxf?.publicUrl ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                title="Ver plano"
                                className="flex size-8 items-center justify-center rounded-lg hover:bg-foreground/10"
                                onClick={() =>
                                  setPreviewDxf({
                                    url: line.dxf!.publicUrl!,
                                    name: line.dxf!.originalName || "plano.dxf",
                                  })
                                }
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                title="Descargar"
                                className="flex size-8 items-center justify-center rounded-lg hover:bg-foreground/10"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(line.dxf!.publicUrl!)
                                    if (!res.ok) throw new Error("fetch")
                                    const blob = await res.blob()
                                    await saveBlobWithPreferences({
                                      blob,
                                      fileName:
                                        line.dxf!.originalName || "plano.dxf",
                                      mimeType: "application/dxf",
                                    })
                                  } catch {
                                    toast.error("No se pudo descargar")
                                  }
                                }}
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </div>
                      ))
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
      <DxfPreviewDialog
        open={!!previewDxf}
        onOpenChange={o => !o && setPreviewDxf(null)}
        url={previewDxf?.url ?? null}
        fileName={previewDxf?.name}
      />
    </Dialog>
  )
}