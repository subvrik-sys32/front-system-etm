"use client"

import { useRef, useState } from "react"
import {
  Download,
  Eye,
  FilePenLine,
  ImageIcon,
  ImagePlus,
  MessageSquare,
  Trash2,
} from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { toast } from "sonner"
import { saveBlobWithPreferences } from "@/features/user-preferences"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { FormDialogHeader } from "@/shared/ui/dialogs/form-dialog/form-dialog-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PhotoViewerDialog } from "@/shared/ui/media-lightbox/photo-viewer-dialog"

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
  readOnly?: boolean
  /** Solo tareas: el padre abre TaskDialog. No hay upload suelto de DXF aquí. */
  onEditTask?: () => void
}

function EmptyHint({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ImageIcon
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-foreground/[0.04] px-4 py-6 text-center">
      <div className="flex size-9 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground">
        <Icon size={16} strokeWidth={2} />
      </div>
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="max-w-[16rem] text-[11px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export function DetailAssetsDialog({
  open,
  onOpenChange,
  taskId,
  projectId,
  readOnly = false,
  onEditTask,
}: Props) {
  const isTask = Boolean(taskId)
  const taskQ = useTaskDetailAssets(taskId, open && isTask)
  const projectQ = useProjectDetailAssets(projectId, open && !isTask)
  const mutations = useDetailAssetMutations({ taskId, projectId })

  const fileRef = useRef<HTMLInputElement>(null)
  const [previewDxf, setPreviewDxf] = useState<{
    url: string
    name: string
  } | null>(null)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [note, setNote] = useState("")

  const photos: DetailAsset[] = isTask
    ? (taskQ.data?.taskAssets.filter(a => a.kind === "PHOTO") ?? [])
    : (projectQ.data.filter(a => a.kind === "PHOTO") ?? [])
  const noteAsset: DetailAsset | undefined = isTask
    ? taskQ.data?.taskAssets.find(a => a.kind === "NOTE")
    : projectQ.data.find(a => a.kind === "NOTE")
  const materialLines = taskQ.data?.materialLines ?? []

  const loading = isTask ? taskQ.loading : projectQ.loading

  const noteFromServer =
    typeof noteAsset?.meta === "object" &&
    noteAsset?.meta &&
    "text" in noteAsset.meta
      ? String((noteAsset.meta as { text?: string }).text ?? "")
      : ""
  const noteText = note || noteFromServer

  const requestEditTask = () => {
    onOpenChange(false)
    onEditTask?.()
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={next => {
          if (!next) onOpenChange(false)
          else onOpenChange(true)
        }}
      >
        <DialogContent
          size="large"
          className="flex max-h-[min(92dvh,100%)] flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xs"
        >
          <FormDialogHeader title="Archivos y detalle" icon={MessageSquare} />

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-5 px-4 py-3 pb-5">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Spinner size={20} className="text-muted-foreground" />
                </div>
              ) : (
                <>
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
                    {photos.length === 0 ? (
                      <EmptyHint
                        icon={ImageIcon}
                        title="Sin fotos todavía"
                        description={
                          readOnly
                            ? "Cuando se suban fotos de referencia aparecerán aquí."
                            : "Añade hasta 2 fotos de referencia del detalle o montaje."
                        }
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {photos.map(p => (
                          <div
                            key={p.id}
                            className="group relative size-20 overflow-hidden rounded-xl bg-muted"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.publicUrl ?? ""}
                              alt=""
                              className="size-full cursor-zoom-in object-cover"
                              onClick={() => {
                                if (p.publicUrl) setPreviewPhoto(p.publicUrl)
                              }}
                            />
                            {!readOnly && (
                              <button
                                type="button"
                                title="Eliminar"
                                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-md bg-background/90 text-muted-foreground opacity-0 shadow-xs transition group-hover:opacity-100 hover:text-destructive"
                                onClick={e => {
                                  e.stopPropagation()
                                  mutations.remove.mutate(p.id)
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Detalle
                    </h3>
                    {readOnly ? (
                      noteFromServer ? (
                        <p className="rounded-xl bg-foreground/[0.04] px-3 py-2.5 text-sm leading-relaxed text-foreground">
                          {noteFromServer}
                        </p>
                      ) : (
                        <EmptyHint
                          icon={MessageSquare}
                          title="Sin nota de detalle"
                          description="No se registró un mensaje o instrucción adicional para esta entidad."
                        />
                      )
                    ) : (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={noteText}
                          onChange={e => setNote(e.target.value)}
                          placeholder="Detalle libre, instrucciones de montaje, observaciones…"
                          rows={3}
                          className="w-full resize-none rounded-xl bg-foreground/[0.04] px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:ring-1 focus:ring-foreground/15"
                        />
                        <button
                          type="button"
                          disabled={
                            !noteText.trim() || mutations.saveNote.isPending
                          }
                          onClick={() =>
                            mutations.saveNote.mutate(noteText.trim(), {
                              onSuccess: () =>
                                toast.success("Detalle guardado"),
                              onError: () => toast.error("No se pudo guardar"),
                            })
                          }
                          className="self-end rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-foreground/15 disabled:opacity-40"
                        >
                          Guardar detalle
                        </button>
                      </div>
                    )}
                  </section>

                  {isTask && (
                    <section className="flex flex-col gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Planos DXF por material
                      </h3>
                      {materialLines.length === 0 ? (
                        <>
                          <EmptyHint
                            icon={FilePenLine}
                            title="Sin líneas de material"
                            description="Los planos DXF se asocian a cada material de la tarea. Editá la tarea para agregar materiales y planos."
                          />
                          {!readOnly && onEditTask && (
                            <button
                              type="button"
                              onClick={requestEditTask}
                              className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-foreground/5 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
                            >
                              <FilePenLine size={14} />
                              Editar tarea
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {materialLines.map(line => (
                            <div
                              key={line.id}
                              className="flex items-center gap-3 rounded-xl bg-foreground/[0.04] px-3 py-2.5"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {line.material?.name ?? "Material"}
                                  {line.thickness?.name
                                    ? ` · ${line.thickness.name}`
                                    : ""}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {line.pieces} pzs
                                  {line.dxf
                                    ? ` · ${line.dxf.originalName}`
                                    : " · sin DXF"}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-0.5">
                                {line.dxf?.publicUrl && (
                                  <>
                                    <button
                                      type="button"
                                      title="Ver plano"
                                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                                      onClick={() =>
                                        setPreviewDxf({
                                          url: line.dxf!.publicUrl!,
                                          name:
                                            line.dxf!.originalName ||
                                            "plano.dxf",
                                        })
                                      }
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Descargar"
                                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(
                                            line.dxf!.publicUrl!,
                                          )
                                          if (!res.ok) throw new Error("fetch")
                                          const blob = await res.blob()
                                          await saveBlobWithPreferences({
                                            blob,
                                            fileName:
                                              line.dxf!.originalName ||
                                              "plano.dxf",
                                            mimeType: "application/dxf",
                                          })
                                        } catch {
                                          toast.error("No se pudo descargar")
                                        }
                                      }}
                                    >
                                      <Download size={14} />
                                    </button>
                                  </>
                                )}
                                {!readOnly && onEditTask && (
                                  <button
                                    type="button"
                                    title={
                                      line.dxf
                                        ? "Editar plano en la tarea"
                                        : "Agregar plano en la tarea"
                                    }
                                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                                    onClick={requestEditTask}
                                  >
                                    <FilePenLine size={14} />
                                  </button>
                                )}
                                {!readOnly && line.dxf && (
                                  <button
                                    type="button"
                                    title="Quitar DXF"
                                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/10 hover:text-destructive"
                                    onClick={() =>
                                      mutations.remove.mutate(line.dxf!.id, {
                                        onSuccess: () =>
                                          toast.success("DXF eliminado"),
                                        onError: () =>
                                          toast.error("No se pudo eliminar"),
                                      })
                                    }
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <DxfPreviewDialog
        open={!!previewDxf}
        onOpenChange={o => !o && setPreviewDxf(null)}
        url={previewDxf?.url ?? null}
        fileName={previewDxf?.name}
      />

      <PhotoViewerDialog
        open={Boolean(previewPhoto)}
        onOpenChange={o => !o && setPreviewPhoto(null)}
        src={previewPhoto}
        title="Foto de detalle"
        alt="Foto de detalle"
      />
    </>
  )
}