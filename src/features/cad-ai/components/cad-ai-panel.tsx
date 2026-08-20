"use client"

import { useState, useCallback, useRef } from "react"
import { Loader2, Layers, MessageSquare, Box, Sparkles, FolderKanban } from "lucide-react"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"
import type { PlanGeometry, Entity, ChatMessage, Skill } from "../types"
import { cadErrorMessage } from "../utils/cad-error-message"
import { cadAiApi, downloadDxf } from "../api/cad-ai.api"
import { UploadZone } from "./upload-zone"
import { DxfViewer } from "./dxf-viewer"
import { IterationPanel } from "./iteration-panel"
import { SaveSkillModal } from "./save-skill-modal"
import { SkillLibrary } from "./skill-library"
import { SkillGenerator } from "./skill-generator"

export function CadAiPanel() {
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
  const [activeTab, setActiveTab] = useState<"ai" | "templates">("ai")

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
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        {error && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <span className="truncate">{error}</span>
            <button type="button" onClick={() => setError(null)} className="hover:opacity-70">×</button>
          </div>
        )}

        {/* Barra superior de navegación estilo chips sin bordes pesados */}
        <div className="flex shrink-0 items-center justify-between px-4 py-2">
          <div role="group" className="rounded-xl bg-muted/60 p-1.5 shadow-2xs dark:bg-muted/80">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setActiveTab("ai"); setShowSkillLibrary(false); }}
                className={cn(
                  "inline-flex select-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                  activeTab === "ai" && !showSkillLibrary
                    ? "bg-foreground/15 text-foreground shadow-2xs"
                    : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground dark:bg-foreground/5 dark:hover:bg-foreground/10"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>IA</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("templates"); setShowSkillLibrary(true); }}
                className={cn(
                  "inline-flex select-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                  showSkillLibrary
                    ? "bg-foreground/15 text-foreground shadow-2xs"
                    : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground dark:bg-foreground/5 dark:hover:bg-foreground/10"
                )}
              >
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>Skills</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido dinámico principal */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <UploadZone onAnalyze={handleAnalyze} onGenerate={handleGenerate} loading={loading} messages={messages} />
        </div>

        {showSkillLibrary && (
          <SkillLibrary 
            onOpenSkill={(s) => { setShowSkillLibrary(false); setSkillGenerator(s); }} 
            onClose={() => { setShowSkillLibrary(false); setActiveTab("ai"); }} 
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {error && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span className="truncate">{error}</span>
          <button type="button" onClick={() => setError(null)} className="hover:opacity-70">×</button>
        </div>
      )}

      {isMobile && (
        <div className="flex shrink-0 items-center gap-1.5 bg-card/80 p-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMobilePane("viewer")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all",
              mobilePane === "viewer" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
              mobilePane === "chat" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Chat & IA
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col desktop:flex-row overflow-hidden relative">
        <div className={cn("relative min-h-0 min-w-0 flex-1 flex-col", isMobile && mobilePane !== "viewer" && "hidden")}>
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <DxfViewer
            geometry={geometry}
            onGeometryChange={handleGeometryChange}
            onSendToAI={(ent) => setSelectedForAI(ent)}
            className="h-full w-full"
          />
        </div>

        <div className={cn("min-h-0 shrink-0 bg-card", isMobile ? (mobilePane === "chat" ? "flex h-full w-full flex-col border-t" : "hidden") : "flex w-80 flex-col border-l desktop:w-96")}>
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