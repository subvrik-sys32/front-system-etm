"use client"

import { useRef, useState } from "react"
import {
  Download,
  Eye,
  FilePenLine,
  FileUp,
  ImageIcon,
  ImagePlus,
  MessageSquare,
  Trash2,
} from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { toast } from "sonner"
import { saveBlobWithPreferences } from "@/features/user-preferences"

import { Dialog, DialogContent } from "@/components/ui/dialog"
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
  /** Solo tareas: abre TaskDialog para líneas de material (no para DXF). */
  onEditTask?: () => void
}

const iconBtn =
  "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"

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

  const ownPhotos: DetailAsset[] = isTask
    ? (taskQ.data?.taskAssets.filter(a => a.kind === "PHOTO") ?? [])
    : (projectQ.data.filter(a => a.kind === "PHOTO") ?? [])
  // herencia proyecto → tarea (solo lectura en el dialog de tarea)
  const inheritedPhotos: DetailAsset[] = isTask
    ? (taskQ.data?.projectAssets?.filter(a => a.kind === "PHOTO") ?? [])
    : []
  const photos: DetailAsset[] = isTask
    ? [...ownPhotos, ...inheritedPhotos]
    : ownPhotos
  const ownPhotoCount = ownPhotos.length
  const noteAsset: DetailAsset | undefined = isTask
    ? (taskQ.data?.taskAssets.find(a => a.kind === "NOTE") ??
      taskQ.data?.projectAssets?.find(a => a.kind === "NOTE"))
    : projectQ.data.find(a => a.kind === "NOTE")
  /** Nota heredada del proyecto: no se edita como nota de tarea. */
  const noteInherited =
    isTask &&
    !taskQ.data?.taskAssets.some(a => a.kind === "NOTE") &&
    Boolean(taskQ.data?.projectAssets?.some(a => a.kind === "NOTE"))
  const materialLines = taskQ.data?.materialLines ?? []

  const loading = isTask ? taskQ.loading : projectQ.loading
  const photoUploading = mutations.uploadPhoto.isPending
  const removingId = mutations.remove.isPending
    ? (mutations.remove.variables as string | undefined)
    : undefined
  const uploadingDxfLineId = mutations.uploadDxf.isPending
    ? mutations.uploadDxf.variables?.lineId
    : undefined
  const dxfBusy =
    mutations.uploadDxf.isPending || mutations.remove.isPending

  const noteFromServer =
    typeof noteAsset?.meta === "object" &&
    noteAsset?.meta &&
    "text" in noteAsset.meta
      ? String((noteAsset.meta as { text?: string }).text ?? "")
      : ""
  const noteText = note || noteFromServer

  const requestEditMaterials = () => {
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
                        Fotos ({isTask ? ownPhotoCount : photos.length}/2)
                      </h3>
                      {!readOnly && (isTask ? ownPhotoCount : photos.length) < 2 && (
                        <>
                          <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={photoUploading}
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
                            disabled={photoUploading}
                            onClick={() => fileRef.current?.click()}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                          >
                            {photoUploading ? (
                              <>
                                <Spinner size={14} />
                                Subiendo…
                              </>
                            ) : (
                              <>
                                <ImagePlus size={14} /> Añadir
                              </>
                            )}
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
                        {photos.map(p => {
                          const inherited =
                            isTask &&
                            Boolean(p.projectId) &&
                            !p.taskId
                          return (
                          <div
                            key={p.id}
                            className={`group relative size-20 overflow-hidden rounded-xl bg-muted ${removingId === p.id ? "opacity-60" : ""}`}
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
                            {inherited && (
                              <span className="absolute bottom-1 left-1 rounded bg-background/90 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Proyecto
                              </span>
                            )}
                            {!readOnly && !inherited && (
                              <button
                                type="button"
                                title="Eliminar"
                                disabled={removingId === p.id || photoUploading}
                                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-md bg-background/90 text-muted-foreground opacity-0 shadow-xs transition group-hover:opacity-100 hover:text-destructive disabled:opacity-100"
                                onClick={e => {
                                  e.stopPropagation()
                                  mutations.remove.mutate(p.id, {
                                    onSuccess: () =>
                                      toast.success("Foto eliminada"),
                                    onError: () =>
                                      toast.error("No se pudo eliminar"),
                                  })
                                }}
                              >
                                {removingId === p.id ? (
                                  <Spinner size={12} />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                              </button>
                            )}
                          </div>
                          )
                        })}
                      </div>
                    )}
                  </section>

                  <section className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Detalle
                      </h3>
                      {noteInherited && (
                        <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Del proyecto
                        </span>
                      )}
                    </div>
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
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Planos DXF por material
                        </h3>
                        {!readOnly && onEditTask && (
                          <button
                            type="button"
                            disabled={dxfBusy}
                            onClick={requestEditMaterials}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                          >
                            <FilePenLine size={14} />
                            Editar materiales
                          </button>
                        )}
                      </div>

                      {materialLines.length === 0 ? (
                        <EmptyHint
                          icon={FilePenLine}
                          title="Sin líneas de material"
                          description="Agregá materiales en la tarea para asociar planos DXF a cada línea."
                        />
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
                                      disabled={dxfBusy}
                                      className={iconBtn}
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
                                      disabled={dxfBusy}
                                      className={iconBtn}
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
                                {!readOnly && (
                                  <>
                                    <input
                                      type="file"
                                      accept=".dxf,application/dxf"
                                      className="hidden"
                                      id={`dxf-upload-${line.id}`}
                                      disabled={dxfBusy}
                                      onChange={e => {
                                        const f = e.target.files?.[0]
                                        e.target.value = ""
                                        if (!f) return
                                        mutations.uploadDxf.mutate(
                                          { lineId: line.id, file: f },
                                          {
                                            onSuccess: () =>
                                              toast.success(
                                                line.dxf
                                                  ? "DXF reemplazado"
                                                  : "DXF subido",
                                              ),
                                            onError: () =>
                                              toast.error(
                                                "No se pudo subir el DXF",
                                              ),
                                          },
                                        )
                                      }}
                                    />
                                    <button
                                      type="button"
                                      title={
                                        line.dxf
                                          ? "Reemplazar DXF"
                                          : "Subir DXF"
                                      }
                                      disabled={dxfBusy}
                                      className={
                                        line.dxf
                                          ? iconBtn
                                          : "inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground/10 px-2.5 text-xs font-semibold text-foreground transition hover:bg-foreground/15 disabled:pointer-events-none disabled:opacity-40"
                                      }
                                      onClick={() =>
                                        document
                                          .getElementById(
                                            `dxf-upload-${line.id}`,
                                          )
                                          ?.click()
                                      }
                                    >
                                      {uploadingDxfLineId === line.id ? (
                                        <>
                                          <Spinner size={14} />
                                          {line.dxf ? null : (
                                            <span>Subiendo…</span>
                                          )}
                                        </>
                                      ) : line.dxf ? (
                                        <FilePenLine size={14} />
                                      ) : (
                                        <>
                                          <FileUp size={14} />
                                          <span>Subir DXF</span>
                                        </>
                                      )}
                                    </button>
                                    {line.dxf && (
                                      <button
                                        type="button"
                                        title="Quitar DXF"
                                        disabled={dxfBusy}
                                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-foreground/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                                        onClick={() =>
                                          mutations.remove.mutate(
                                            line.dxf!.id,
                                            {
                                              onSuccess: () =>
                                                toast.success("DXF eliminado"),
                                              onError: () =>
                                                toast.error(
                                                  "No se pudo eliminar",
                                                ),
                                            },
                                          )
                                        }
                                      >
                                        {removingId === line.dxf?.id ? (
                                          <Spinner size={14} />
                                        ) : (
                                          <Trash2 size={14} />
                                        )}
                                      </button>
                                    )}
                                  </>
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