"use client"

import { useState, useEffect, useRef } from "react"
import { Download, Loader2, Layers, ArrowRight } from "lucide-react"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { FormDialogHeader } from "@/shared/ui/dialogs/form-dialog/form-dialog-header"
import { cn } from "@/shared/utils/utils"
import type { Skill, PlanGeometry } from "../types"
import { cadAiApi, downloadDxf } from "../api/cad-ai.api"
import { DxfViewer } from "./dxf-viewer"

interface SkillGeneratorProps {
  skill: Skill
  onClose: () => void
  onLoadToWorkspace?: (geometry: PlanGeometry, dxf: string) => void
}

const EASE = "duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
const CARD = `rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] transition-colors ${EASE}`
const FIELD_WRAP = "flex items-center gap-2 rounded-lg bg-foreground/5 px-3 py-2"

export function SkillGenerator({
  skill,
  onClose,
  onLoadToWorkspace,
}: SkillGeneratorProps) {
  const [params, setParams] = useState<Record<string, number | string>>({})
  const [geometry, setGeometry] = useState<PlanGeometry | null>(null)
  const [dxf, setDxf] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const geometryRef = useRef<PlanGeometry | null>(null)

  useEffect(() => {
    const defaults: Record<string, number | string> = {}
    for (const p of skill.parameters) {
      defaults[p.name] = p.default
    }
    setParams(defaults)
  }, [skill])

  const handleGenerate = async (nextParams: Record<string, number | string>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await cadAiApi.generateFromSkill(skill.id, nextParams)
      setGeometry(result.geometry)
      geometryRef.current = result.geometry
      setDxf(result.dxf)
    } catch (err: any) {
      setError(err?.message ?? "Error al generar")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (Object.keys(params).length === 0) return
    void handleGenerate(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const handleParamChange = (name: string, value: string) => {
    const num = parseFloat(value)
    setParams(prev => ({ ...prev, [name]: isNaN(num) ? value : num }))
  }

  const handleDownload = async () => {
    const geom = geometryRef.current
    if (!geom) return
    try {
      const freshDxf = await cadAiApi.exportDxf(geom)
      downloadDxf(freshDxf, `${skill.name}.dxf`)
    } catch (err: any) {
      setError(err?.message ?? "Error al exportar")
    }
  }

  const handleLoadToWorkspace = () => {
    const geom = geometryRef.current
    if (!geom) return
    onLoadToWorkspace?.(geom, dxf)
  }

  return (
    <Dialog open onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent
        size="large"
        className={cn(
          "flex flex-col gap-0 overflow-hidden rounded-2xl p-0 text-foreground shadow-xs",
          "h-[85vh] max-h-[85vh] w-full max-w-5xl bg-popover",
        )}
      >
        <div className="shrink-0">
          <FormDialogHeader
            title={skill.name}
            description="Ajusta parámetros y genera el DXF"
            icon={Layers}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden desktop:flex-row">
          <div className="max-h-[40%] shrink-0 space-y-3 overflow-y-auto border-b border-foreground/[0.06] px-5 py-3 desktop:max-h-none desktop:w-72 desktop:border-b-0 desktop:border-r">
            {skill.parameters.map(p => (
              <label key={p.name} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {p.label ?? p.name}
                </span>
                <div className={FIELD_WRAP}>
                  <input
                    type="number"
                    value={params[p.name] ?? ""}
                    onChange={e => handleParamChange(p.name, e.target.value)}
                    className="w-full bg-transparent text-sm tabular-nums outline-none"
                  />
                </div>
              </label>
            ))}
            {error && (
              <p className="text-xs font-medium text-destructive">{error}</p>
            )}
          </div>

          <div className="relative min-h-0 flex-1">
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
                <Loader2 className="size-7 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Generando vista previa…</p>
              </div>
            )}
            {geometry ? (
              <DxfViewer
                geometry={geometry}
                onGeometryChange={g => {
                  geometryRef.current = g
                }}
                className="h-full w-full"
              />
            ) : !loading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Generando vista previa...
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-foreground/[0.06] px-5 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className={cn("px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground", CARD)}
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!geometry || loading}
              className={cn("inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-50", CARD)}
            >
              <Download className="size-4" />
              DXF
            </button>
            <button
              type="button"
              onClick={handleLoadToWorkspace}
              disabled={!geometry || loading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity ${EASE} hover:opacity-90 disabled:opacity-50`}
            >
              Usar en workspace
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}