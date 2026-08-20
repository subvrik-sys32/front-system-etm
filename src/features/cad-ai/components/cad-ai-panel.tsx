"use client"

import { useState, useCallback, useRef } from "react"
import { Loader2, Layers, MessageSquare, Box } from "lucide-react"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"
import { CHROME_ICON_BTN } from "@/shared/ui/actions/icon-action"
import type { PlanGeometry, Entity, ChatMessage, Skill } from "../types"
import { cadErrorMessage } from "../utils/cad-error-message"
import { cadAiApi, downloadDxf } from "../api/cad-ai.api"
import { UploadZone } from "./upload-zone"
import { DxfViewer } from "./dxf-viewer"
import { IterationPanel } from "./iteration-panel"
import { SaveSkillModal } from "./save-skill-modal"
import { SkillLibrary } from "./skill-library"
import { SkillGenerator } from "./skill-generator"

export function CadAiPanel({ embedded = false }: { embedded?: boolean } = {}) {
  void embedded
  const [geometry, setGeometry] = useState<PlanGeometry | null>(null)
  const [dxf, setDxf] = useState<string>("")
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedForAI, setSelectedForAI] = useState<Entity[] | null>(null)
  const [showSaveSkill, setShowSaveSkill] = useState(false)
  const [showSkillLibrary, setShowSkillLibrary] = useState(false)
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null)
  const [skillParams, setSkillParams] = useState<Record<string, number | string> | null>(null)
  const [skillGenerator, setSkillGenerator] = useState<Skill | null>(null)
  const [mobilePane, setMobilePane] = useState<"viewer" | "chat">("viewer")

  const { isMobile } = useResponsive()
  const geometryRef = useRef<PlanGeometry | null>(null)

  const handleAnalyze = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    setImagePath(URL.createObjectURL(file))
    try {
      const result = await cadAiApi.analyzeImage(file)
      setGeometry(result.geometry)
      setDxf(result.dxf)
      geometryRef.current = result.geometry
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `He analizado tu plano. Encontré ${result.geometry.entities.length} entidades.`,
        geometry: result.geometry,
      }])
    } catch (err: any) {
      setError(cadErrorMessage(err, "Error al analizar la imagen"))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleGenerate = useCallback(async (prompt: string) => {
    setLoading(true)
    setError(null)
    setMessages(prev => [...prev, { role: "user", content: prompt }])
    try {
      const result = await cadAiApi.generateFromText(prompt)
      setGeometry(result.geometry)
      setDxf(result.dxf)
      geometryRef.current = result.geometry
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `He generado la geometría: ${result.geometry.entities.length} entidades.`,
        geometry: result.geometry,
      }])
    } catch (err: any) {
      setError(cadErrorMessage(err, "Error al generar la geometría"))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleIterate = useCallback(async (feedback: string) => {
    if (!geometry) return
    setLoading(true)
    setError(null)
    setMessages(prev => [...prev, { role: "user", content: feedback }])
    try {
      const result = await cadAiApi.iterateGeometry(geometry, feedback, selectedForAI || undefined)
      setGeometry(result.geometry)
      setDxf(result.dxf)
      geometryRef.current = result.geometry
      setSelectedForAI(null)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `He actualizado la geometría (${result.geometry.entities.length} entidades).`,
        geometry: result.geometry,
      }])
    } catch (err: any) {
      setError(cadErrorMessage(err, "Error al iterar"))
    } finally {
      setLoading(false)
    }
  }, [geometry, selectedForAI])

  const handleGeometryChange = useCallback((newGeom: PlanGeometry) => {
    setGeometry(newGeom)
    geometryRef.current = newGeom
  }, [])

  const handleDownload = useCallback(async () => {
    const geom = geometryRef.current
    if (!geom) return
    try {
      const freshDxf = await cadAiApi.exportDxf(geom)
      downloadDxf(freshDxf)
    } catch (err: any) {
      setError(cadErrorMessage(err, "Error al exportar DXF"))
    }
  }, [])

  const handleReset = useCallback(() => {
    setGeometry(null)
    setDxf("")
    setImagePath(null)
    setError(null)
    setMessages([])
    setSelectedForAI(null)
    setActiveSkill(null)
    setSkillParams(null)
    geometryRef.current = null
  }, [])

  if (!geometry) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-background [scrollbar-width:none]">
        {error && (
          <div className="flex shrink-0 items-center justify-between gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <span className="truncate">{error}</span>
            <button type="button" onClick={() => setError(null)} className="hover:opacity-70">×</button>
          </div>
        )}

        {/* Botón de Skills con icono y texto, sin contenedor de fondo adicional */}
        <div className="flex shrink-0 px-4 py-3">
          <button
            type="button"
            aria-label="Skills"
            title="Skills"
            onClick={(e) => {
              e.stopPropagation()
              setShowSkillLibrary(true)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(CHROME_ICON_BTN, "h-9 w-auto gap-2 px-3 text-xs font-semibold")}
          >
            <Layers size={14} strokeWidth={2.25} />
            <span>Skills</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="flex w-full flex-col">
          <UploadZone onAnalyze={handleAnalyze} onGenerate={handleGenerate} loading={loading} messages={messages} />
        </div>

        {showSkillLibrary && (
          <SkillLibrary 
            onOpenSkill={(s) => { setShowSkillLibrary(false); setSkillGenerator(s); }} 
            onClose={() => setShowSkillLibrary(false)} 
          />
        )}
        {skillGenerator && (
          <SkillGenerator 
            skill={skillGenerator} 
            onClose={() => setSkillGenerator(null)} 
            onLoadToWorkspace={(g, d) => { setGeometry(g); setDxf(d); geometryRef.current = g; setSkillGenerator(null); }} 
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      {error && (
        <div className="flex shrink-0 items-center justify-between gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span className="truncate">{error}</span>
          <button type="button" onClick={() => setError(null)} className="hover:opacity-70">×</button>
        </div>
      )}

      {isMobile && (
        <div className="mb-2 flex shrink-0 items-center gap-1 rounded-xl bg-muted/60 p-1 dark:bg-muted/80">
          <button
            type="button"
            onClick={() => setMobilePane("viewer")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all",
              mobilePane === "viewer" ? "bg-foreground/15 text-foreground shadow-2xs" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <Box className="h-4 w-4" />
            Lienzo 3D / DXF
          </button>
          <button
            type="button"
            onClick={() => setMobilePane("chat")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all",
              mobilePane === "chat" ? "bg-foreground/15 text-foreground shadow-2xs" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Chat & IA
          </button>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col gap-0 overflow-hidden desktop:flex-row desktop:gap-3">
        <div className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-muted/30", isMobile && mobilePane !== "viewer" && "hidden")}>
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <DxfViewer
            geometry={geometry}
            onGeometryChange={handleGeometryChange}
            onSendToAI={(ent) => setSelectedForAI(ent)}
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className={cn(
            "min-h-0 overflow-hidden rounded-xl bg-card",
            isMobile
              ? mobilePane === "chat"
                ? "flex h-full w-full flex-1 flex-col"
                : "hidden"
              : "flex w-full max-w-sm shrink-0 flex-col desktop:w-96",
          )}>
          <IterationPanel
            geometry={geometry}
            dxf={dxf}
            imagePath={imagePath}
            onIterate={handleIterate}
            onSaveSkill={() => setShowSaveSkill(true)}
            onDownload={handleDownload}
            onReset={handleReset}
            loading={loading}
            messages={messages}
            selectedForAI={selectedForAI}
            onClearAISelection={() => setSelectedForAI(null)}
            activeSkill={activeSkill}
            skillParams={skillParams}
            onSkillParamsChange={setSkillParams}
            onSkillRegenerate={async () => {}}
          />
        </div>
      </div>

      {showSaveSkill && (
        <SaveSkillModal
          geometry={geometry}
          thumbnailPath={imagePath && !imagePath.startsWith("blob:") ? imagePath : null}
          onSaved={(skill) => { setShowSaveSkill(false); setActiveSkill(skill); }}
          onClose={() => setShowSaveSkill(false)}
        />
      )}
    </div>
  )
}