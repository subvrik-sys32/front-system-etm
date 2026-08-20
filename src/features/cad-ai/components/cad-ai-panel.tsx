"use client"

import { useState, useCallback, useRef } from "react"
import { Loader2, Layers, MessageSquare, Box, SlidersHorizontal } from "lucide-react"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"
import { CHROME_ICON_BTN } from "@/shared/ui/actions/icon-action"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FormDialogHeader } from "@/shared/ui/dialogs/form-dialog/form-dialog-header"
import type { PlanGeometry, Entity, ChatMessage, Skill } from "../types"
import { cadErrorMessage } from "../utils/cad-error-message"
import { cadAiApi, downloadDxf } from "../api/cad-ai.api"
import { UploadZone } from "./upload-zone"
import { DxfViewer } from "./dxf-viewer"
import { IterationPanel } from "./iteration-panel"
import { SaveSkillModal } from "./save-skill-modal"
import { SkillLibrary } from "./skill-library"
import { SkillGenerator } from "./skill-generator"
import CursorRingField from "./cursor-ring-.field"

const RING_DOT_SIZE = {
  empty: { mobile: 95, tablet: 92, desktop: 90 },
  active: { mobile: 130, tablet: 124, desktop: 120 },
} as const

function useRingDotSize(variant: keyof typeof RING_DOT_SIZE) {
  const { isMobile, isTablet } = useResponsive() as {
    isMobile: boolean
    isTablet?: boolean
  }
  const scale = RING_DOT_SIZE[variant]
  if (isMobile) return scale.mobile
  if (isTablet) return scale.tablet
  return scale.desktop
}

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
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)

  const { isMobile, isCompact } = useResponsive()
  const geometryRef = useRef<PlanGeometry | null>(null)

  const emptyDotSize = useRingDotSize("empty")
  const activeDotSize = useRingDotSize("active")

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
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-background shadow-xs [scrollbar-width:none]">
        {!isMobile && (
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-auto">
            <CursorRingField
              background="transparent"
              dotSize={emptyDotSize}
              density={300}
              speed={36}
              cameraDistance={270}
              colors={["#3074f9", "#7189ff", "#0b0b18"]}
            />
          </div>
        )}

        <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
          {error && (
            <div className="flex shrink-0 items-center justify-between gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-xs">
              <span className="truncate">{error}</span>
              <button type="button" onClick={() => setError(null)} className="hover:opacity-70">×</button>
            </div>
          )}

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
              className={cn(CHROME_ICON_BTN, "h-9 w-auto gap-2 px-3 text-xs font-semibold shadow-xs backdrop-blur-xs")}
            >
              <Layers size={14} strokeWidth={2.25} />
              <span>Skills</span>
            </button>
          </div>

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
      </div>
    )
  }

  const iterationContent = (
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
  )

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background shadow-xs">
      {!isMobile && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-auto">
          <CursorRingField
            background="transparent"
            dotSize={activeDotSize}
            density={200}
            speed={4}
            colors={["#3074f9", "#7189ff", "#0b0b18"]}
          />
        </div>
      )}

      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        {error && (
          <div className="flex shrink-0 items-center justify-between gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-xs">
            <span className="truncate">{error}</span>
            <button type="button" onClick={() => setError(null)} className="hover:opacity-70">×</button>
          </div>
        )}

        {isCompact && (
          <div className="absolute inset-x-0 top-2 z-10 flex h-11 items-center gap-1.5 px-2">
            <div className="flex flex-1 items-center gap-1 rounded-xl bg-muted/80 p-1 shadow-xs backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setMobilePane("viewer")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
                  mobilePane === "viewer" ? "bg-foreground/15 text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Box className="h-4 w-4" />
                Lienzo 3D / DXF
              </button>
              <button
                type="button"
                onClick={() => setMobilePane("chat")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
                  mobilePane === "chat" ? "bg-foreground/15 text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                Chat & IA
              </button>
            </div>
            <button
              type="button"
              aria-label="Abrir panel de control"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground shadow-xs"
              onClick={() => setIsMobilePanelOpen(true)}
            >
              <SlidersHorizontal size={16} strokeWidth={2.2} />
            </button>
          </div>
        )}

        {!isCompact ? (
          <div className="flex h-full min-h-0 w-full flex-1 items-stretch gap-3 overflow-hidden p-2">
            {/* Contenedor del visor CAD unificado con shadow-xs */}
            <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-muted/30 shadow-xs backdrop-blur-[2px]">
              {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              <DxfViewer
                geometry={geometry}
                onGeometryChange={handleGeometryChange}
                onSendToAI={(ent) => setSelectedForAI(ent)}
                className="absolute inset-0 h-full w-full shadow-xs"
              />
            </div>
            <aside className="flex h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden rounded-2xl bg-card/90 shadow-xs backdrop-blur-md desktop:w-96">
              {iterationContent}
            </aside>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 top-14 mx-1 mb-1 overflow-hidden rounded-xl bg-zinc-100 shadow-xs dark:bg-neutral-950">
            <div className="absolute inset-0 overflow-hidden">
              {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {mobilePane === "viewer" ? (
                <DxfViewer
                  geometry={geometry}
                  onGeometryChange={handleGeometryChange}
                  onSendToAI={(ent) => setSelectedForAI(ent)}
                  className="absolute inset-0 h-full w-full shadow-xs"
                />
              ) : (
                <div className="flex h-full flex-col overflow-hidden shadow-xs">
                  {iterationContent}
                </div>
              )}
            </div>
          </div>
        )}

        <Dialog
          open={isCompact && isMobilePanelOpen}
          onOpenChange={(open) => {
            if (!open) setIsMobilePanelOpen(false)
          }}
        >
          <DialogContent
            size="large"
            className="flex max-h-[min(92dvh,100%)] h-[min(92dvh,100%)] w-[calc(100vw-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border-none bg-popover p-0 text-foreground shadow-xs"
          >
            <div className="shrink-0">
              <FormDialogHeader title="Opciones de IA y DXF" icon={SlidersHorizontal} />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
              {iterationContent}
            </div>
          </DialogContent>
        </Dialog>

        {showSaveSkill && (
          <SaveSkillModal
            geometry={geometry}
            thumbnailPath={imagePath && !imagePath.startsWith("blob:") ? imagePath : null}
            onSaved={(skill) => { setShowSaveSkill(false); setActiveSkill(skill); }}
            onClose={() => setShowSaveSkill(false)}
          />
        )}
      </div>
    </div>
  )
}