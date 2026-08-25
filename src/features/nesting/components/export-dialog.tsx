"use client"

import { useMemo, useState } from "react"
import {
  FileUp,
  Download,
  Save,
  Layers,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FormDialogHeader } from "@/shared/ui/dialogs/form-dialog/form-dialog-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { EntitySelect } from "@/shared/ui/entity-select/entity-select"
import { cn } from "@/shared/utils/utils"
import { useMaterials } from "@/features/materials/hooks/use-materials"
import type { Material } from "@/features/materials/types/material.types"

import type { NestedSheet, SheetConfig } from "../engine/types"
import { formatSheetRangeLabel, type SheetGroup } from "../utils/svg-render"
import { buildPieceCatalog, type PieceNameMap } from "../export/piece-catalog"
import { exportNestingReportPdf } from "../export/nesting-report-pdf"
import {
  type Nomenclatura,
  validateNomenclatura,
  isNomenclaturaReady,
  currentExportYear,
} from "../export/nomenclatura"

type Props = {
  open: boolean
  onClose: () => void
  sheetGroups: SheetGroup[]
  sheets: NestedSheet[] | null
  sheetConfig: SheetConfig
  nomenclatura: Nomenclatura
  onNomenclaturaChange: (patch: {
    proyecto?: string
    tag?: string
    lote?: string
    material?: string
  }) => void
  sheetMaterials?: Record<number, string>
  onSheetMaterialChange?: (sheetIndex: number, materialCode: string) => void
  onExportSheet: (
    format: "dxf" | "nsp",
    sheetIndex: number,
    materialCode?: string,
  ) => Promise<void> | void
  onExportMosaic?: (format: "dxf" | "nsp") => Promise<void> | void
  onSaveProject: () => void
  nameById?: PieceNameMap
  cliente?: string
  maquina?: string
}

function materialCode(m?: Material | null): string {
  return (m?.code || m?.name || "").trim().toUpperCase()
}

function findMaterial(
  materials: Material[],
  code: string | undefined,
): Material | undefined {
  const c = code?.trim().toUpperCase()
  if (!c) return undefined
  return materials.find(
    m =>
      m.code?.toUpperCase() === c ||
      m.name?.toUpperCase() === c,
  )
}

export function ExportDialog({
  open,
  onClose,
  sheetGroups,
  sheets,
  sheetConfig,
  nomenclatura,
  onNomenclaturaChange,
  sheetMaterials,
  onSheetMaterialChange,
  onExportSheet,
  onExportMosaic,
  onSaveProject,
  nameById,
  cliente,
  maquina,
}: Props) {
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [exportingSheetKey, setExportingSheetKey] = useState<string | null>(
    null,
  )
  const [attempted, setAttempted] = useState(false)
  const [rowAttempt, setRowAttempt] = useState<number | null>(null)

  const {
    materials,
    create: createMaterial,
    update: updateMaterial,
    remove: deleteMaterial,
  } = useMaterials()

  const generalMaterial = useMemo(
    () => findMaterial(materials, nomenclatura.material),
    [materials, nomenclatura.material],
  )

  const baseErrors = useMemo(
    () => validateNomenclatura(nomenclatura, { requireMaterial: false }),
    [nomenclatura],
  )
  const baseReady = isNomenclaturaReady(nomenclatura, {
    requireMaterial: false,
  })

  const catalog = useMemo(
    () => (sheets ? buildPieceCatalog(sheets, nameById) : []),
    [sheets, nameById],
  )

  /** Override por plancha, si no → material general. */
  function materialFor(index: number): string {
    const own = (sheetMaterials?.[index] || "").trim().toUpperCase()
    if (own) return own
    return (nomenclatura.material || "").trim().toUpperCase()
  }

  function requireBase(): boolean {
    if (baseReady) return true
    setAttempted(true)
    return false
  }

  async function handleExportReport() {
    if (!sheets || isExportingPdf) return
    if (!requireBase()) return
    const mat =
      materialFor(sheetGroups[0]?.startIndex ?? 0) || nomenclatura.material
    if (!mat) {
      setAttempted(true)
      return
    }
    try {
      setIsExportingPdf(true)
      await exportNestingReportPdf({
        nomenclatura: { ...nomenclatura, material: mat },
        sheets,
        sheetConfig,
        nameById,
        materialLabel: mat,
        espesorLabel: nomenclatura.espesor,
        cliente,
        maquina,
      })
    } finally {
      setIsExportingPdf(false)
    }
  }

  async function handleSheetAction(
    format: "dxf" | "nsp",
    sheetIndex: number,
  ) {
    if (!requireBase()) return
    const mat = materialFor(sheetIndex)
    if (!mat) {
      setRowAttempt(sheetIndex)
      setAttempted(true)
      return
    }
    const key = `${sheetIndex}-${format}`
    if (exportingSheetKey === key) return
    try {
      setExportingSheetKey(key)
      await onExportSheet(format, sheetIndex, mat)
    } finally {
      setExportingSheetKey(null)
    }
  }

  async function handleMosaic() {
    if (!onExportMosaic) return
    if (!requireBase()) return
    // Mosaico: basta material general, o todos los de plancha resueltos
    const missing = sheetGroups.filter(g => !materialFor(g.startIndex))
    if (missing.length) {
      setAttempted(true)
      setRowAttempt(missing[0].startIndex)
      return
    }
    await onExportMosaic("dxf")
  }

  const fieldCls = (err?: string) =>
    cn(
      "h-9 w-full rounded-lg border-0 bg-background/50 px-3 text-xs uppercase text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
      attempted && err && "ring-1 ring-destructive/60",
    )

  const yy = nomenclatura.anio || currentExportYear()
  const previewProj = (
    nomenclatura.proyecto?.trim()
      ? nomenclatura.tag?.trim()
        ? `${nomenclatura.proyecto}-${nomenclatura.tag}`
        : nomenclatura.proyecto
      : "###"
  ).toUpperCase()

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent
        size="large"
        className="flex max-h-[min(92dvh,100%)] flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xs [&>button]:hidden"
      >
        <FormDialogHeader title="Exportar nesting" icon={FileUp} />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 px-4 py-3 pb-5">
            <section className="flex flex-col gap-2 rounded-xl bg-foreground/[0.03] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Datos de exportación
              </p>
              <p className="font-mono text-[10px] uppercase leading-relaxed text-muted-foreground">
                {`PRY${yy}-${previewProj}_L${nomenclatura.lote || "#"}_${nomenclatura.material || "MAT"}_ESPESOR_Q…_P…`}
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Proyecto
                  </label>
                  <Input
                    className={fieldCls(baseErrors.proyecto)}
                    placeholder="130"
                    inputMode="numeric"
                    value={nomenclatura.proyecto}
                    onChange={e =>
                      onNomenclaturaChange({
                        // Solo número; letras van en Tag
                        proyecto: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                  {attempted && baseErrors.proyecto && (
                    <span className="text-[10px] text-destructive">
                      {baseErrors.proyecto}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Tag{" "}
                    <span className="font-normal normal-case opacity-70">
                      (opc.)
                    </span>
                  </label>
                  <Input
                    className={fieldCls()}
                    placeholder="EM"
                    value={nomenclatura.tag}
                    onChange={e =>
                      onNomenclaturaChange({
                        tag: e.target.value.replace(/\s/g, "").toUpperCase(),
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Lote
                  </label>
                  <Input
                    className={fieldCls(baseErrors.lote)}
                    placeholder="1"
                    inputMode="numeric"
                    value={nomenclatura.lote}
                    onChange={e =>
                      onNomenclaturaChange({
                        lote: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                  {attempted && baseErrors.lote && (
                    <span className="text-[10px] text-destructive">
                      {baseErrors.lote}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Material general
                  </label>
                  <EntitySelect
                    collection="materials"
                    value={generalMaterial}
                    items={materials}
                    placeholder="Material"
                    onChange={entity => {
                      onNomenclaturaChange({
                        material: materialCode(entity),
                      })
                    }}
                    onCreate={createMaterial}
                    onEdit={updateMaterial}
                    onDelete={deleteMaterial}
                  />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground">
                Material general aplica a mosaico e individuales. Si una plancha
                tiene material propio, ese gana. El lote es único para todo el
                paquete de nesting.
              </p>

              {attempted && !baseReady && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
                  Completá proyecto y lote inicial para exportar.
                </p>
              )}
              {attempted &&
                baseReady &&
                !nomenclatura.material?.trim() &&
                sheetGroups.some(g => !materialFor(g.startIndex)) && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
                    Elegí material general o por plancha.
                  </p>
                )}
            </section>

            <section className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => void handleExportReport()}
                disabled={!sheets?.length}
                className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-foreground/10 disabled:opacity-40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground group-hover:text-foreground">
                  {isExportingPdf ? (
                    <Spinner size={18} />
                  ) : (
                    <FileText size={18} />
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-foreground">
                    Reporte PDF
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    Resumen, planchas y catálogo (BOM)
                  </span>
                </div>
              </button>

              {sheetGroups.length > 0 && onExportMosaic && (
                <button
                  type="button"
                  onClick={() => void handleMosaic()}
                  className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-foreground/10"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground group-hover:text-foreground">
                    <Layers size={18} />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-foreground">
                      Mosaico DXF
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      Un archivo · {sheetGroups.length} layouts
                    </span>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={onSaveProject}
                className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-foreground/10"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground group-hover:text-foreground">
                  <Save size={18} />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-foreground">
                    Guardar proyecto
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    Sesión de nesting en el servidor
                  </span>
                </div>
              </button>
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Planchas
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {sheetGroups.length} total
                </span>
              </div>

              {!sheetGroups.length ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Nestea primero para exportar planchas individuales.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {sheetGroups.map((group, index) => {
                    const loadingDxf =
                      exportingSheetKey === `${group.startIndex}-dxf`
                    const loadingNsp =
                      exportingSheetKey === `${group.startIndex}-nsp`
                    const overrideCode = (
                      sheetMaterials?.[group.startIndex] || ""
                    ).trim()
                    const rowMaterial = findMaterial(
                      materials,
                      overrideCode || undefined,
                    )
                    const resolved = materialFor(group.startIndex)
                    const needMat =
                      rowAttempt === group.startIndex && !resolved
                    const loteLabel = nomenclatura.lote?.trim()
                      ? ` · L${nomenclatura.lote.trim()}`
                      : ""
                    return (
                      <div
                        key={group.startIndex}
                        style={{
                          animationDelay: `${Math.min(index, 8) * 25}ms`,
                        }}
                        className="animate-comment-in flex flex-col gap-2 rounded-lg p-2 transition-colors hover:bg-foreground/5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex min-w-0 flex-col">
                            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                              {formatSheetRangeLabel(group)}
                              {group.count > 1 && (
                                <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                                  ×{group.count}
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {group.sheet.pieces.length} piezas
                              {loteLabel}
                              {resolved
                                ? ` · ${resolved}`
                                : " · sin material"}
                            </span>
                          </div>
                          <div className="w-full sm:max-w-[12rem]">
                            <EntitySelect
                              collection="materials"
                              value={rowMaterial}
                              items={materials}
                              placeholder={
                                nomenclatura.material
                                  ? `Hereda ${nomenclatura.material}`
                                  : "Material"
                              }
                              onChange={entity => {
                                onSheetMaterialChange?.(
                                  group.startIndex,
                                  materialCode(entity),
                                )
                              }}
                              onCreate={createMaterial}
                              onEdit={updateMaterial}
                              onDelete={deleteMaterial}
                            />
                            {needMat && (
                              <span className="mt-1 block text-[10px] text-destructive">
                                Elegí material general o de esta plancha
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2 self-end sm:self-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={loadingDxf || loadingNsp}
                            onClick={() =>
                              void handleSheetAction(
                                "dxf",
                                group.startIndex,
                              )
                            }
                            className="h-8 border-0 bg-foreground/5 px-3 text-xs text-foreground shadow-none hover:bg-foreground/10 disabled:opacity-50"
                          >
                            {loadingDxf ? (
                              <Spinner className="mr-1.5 h-3.5 w-3.5 text-foreground" />
                            ) : (
                              <Download
                                size={14}
                                className="mr-1.5 opacity-70"
                              />
                            )}
                            {loadingDxf ? "…" : "DXF"}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={loadingDxf || loadingNsp}
                            onClick={() =>
                              void handleSheetAction(
                                "nsp",
                                group.startIndex,
                              )
                            }
                            className="h-8 border-0 bg-foreground/5 px-3 text-xs text-foreground shadow-none hover:bg-foreground/10 disabled:opacity-50"
                          >
                            {loadingNsp ? (
                              <Spinner className="mr-1.5 h-3.5 w-3.5 text-foreground" />
                            ) : (
                              <Download
                                size={14}
                                className="mr-1.5 opacity-70"
                              />
                            )}
                            {loadingNsp ? "…" : "NSP"}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
