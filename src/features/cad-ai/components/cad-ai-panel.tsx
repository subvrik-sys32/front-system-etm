"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { useChromeInset } from "@/shared/responsive/layout/use-chrome-inset"
import { useCadAiSessionStore } from "../store/cad-ai-session-store"
import { cn } from "@/shared/utils/utils"
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

export function CadAiPanel({
  layout = "desktop",
  mobilePanelOpen,
  onMobilePanelOpenChange,
  onHasVisualizerChange,
  onRegisterOpenSkills,
}: {
  /** Vista fija — no mezcla reglas mobile/desktop. */
  layout?: "mobile" | "desktop"
  mobilePanelOpen?: boolean
  onMobilePanelOpenChange?: (open: boolean) => void
  /** True cuando hay geometría (visualizer activo). */
  onHasVisualizerChange?: (has: boolean) => void
  /** Compact chrome: Skills en la fila del toggle (page). */
  onRegisterOpenSkills?: (open: () => void) => void
} = {}) {
  const isMobileLayout = layout === "mobile"
  /**
   * Top clear (DesktopTopBar), same SSOT as AppListScroll:
   * - CompactShell (isMobile): immersive slot already clears top → no pad
   * - CadPageCompact on tablet (layout mobile, !isMobile): page section owns pad
   * - CadPageDesktop (layout desktop): this panel owns pad
   */
  const { isMobile: isMobileShell } = useResponsive()
  const chromeInset = useChromeInset({ bottom: false })
  const contentInsetStyle =
    isMobileShell || isMobileLayout ? undefined : chromeInset
  const geometry = useCadAiSessionStore(s => s.geometry)
  const setGeometry = useCadAiSessionStore(s => s.setGeometry)
  const dxf = useCadAiSessionStore(s => s.dxf)
  const setDxf = useCadAiSessionStore(s => s.setDxf)
  const messages = useCadAiSessionStore(s => s.messages)
  const setMessages = useCadAiSessionStore(s => s.setMessages)
  const resetSession = useCadAiSessionStore(s => s.reset)
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onHasVisualizerChange?.(geometry !== null)
  }, [geometry, onHasVisualizerChange])
  const [selectedForAI, setSelectedForAI] = useState<Entity[] | null>(null)
  const [showSaveSkill, setShowSaveSkill] = useState(false)
  const [showSkillLibrary, setShowSkillLibrary] = useState(false)

  useEffect(() => {
    onRegisterOpenSkills?.(() => setShowSkillLibrary(true))
  }, [onRegisterOpenSkills])

  const [activeSkill, setActiveSkill] = useState<Skill | null>(null)
  const [skillParams, setSkillParams] = useState<Record<string, number | string> | null>(null)
  const [skillGenerator, setSkillGenerator] = useState<Skill | null>(null)

  const [internalMobilePanelOpen, setInternalMobilePanelOpen] = useState(false)
  const isMobilePanelOpen =
    mobilePanelOpen !== undefined ? mobilePanelOpen : internalMobilePanelOpen
  const setIsMobilePanelOpen = (open: boolean) => {
    onMobilePanelOpenChange?.(open)
    if (mobilePanelOpen === undefined) setInternalMobilePanelOpen(open)
  }

  // layout prop es SSOT
  const geometryRef = useRef<PlanGeometry | null>(null)

  // Restaurar ref al hidratar sesión (navegación / toggle IA↔Plantillas)
  useEffect(() => {
    geometryRef.current = geometry
  }, [geometry])


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
    resetSession()
    setImagePath(null)
    setError(null)
    setSelectedForAI(null)
    setActiveSkill(null)
    setSkillParams(null)
    geometryRef.current = null
  }, [resetSession])

  if (!geometry) {
    return (
      <div className="relative flex min-h-0 w-full flex-1 flex-col bg-background">
        {/* Fondo decorativo: full-bleed, puede ir bajo el topbar */}
        {!isMobileLayout && (
          <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
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

        {/* Contenido: inset top solo fuera de CompactShell */}
        <div
          className="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden"
          style={contentInsetStyle}
        >
          {error && (
            <div className="flex shrink-0 items-center justify-between gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-xs">
              <span className="truncate">{error}</span>
              <button type="button" onClick={() => setError(null)} className="hover:opacity-70">×</button>
            </div>
          )}

          <div className="flex min-h-0 w-full flex-1 flex-col">
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
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background shadow-xs">
      {!isMobileLayout && (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
          <CursorRingField
            background="transparent"
            dotSize={activeDotSize}
            density={200}
            speed={4}
            colors={["#3074f9", "#7189ff", "#0b0b18"]}
          />
        </div>
      )}

      <div
        className="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden"
        style={contentInsetStyle}
      >
        {error && (
          <div className="flex shrink-0 items-center justify-between gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-xs">
            <span className="truncate">{error}</span>
            <button type="button" onClick={() => setError(null)} className="hover:opacity-70">×</button>
          </div>
        )}

        {!isMobileLayout ? (
          <div className="flex h-full min-h-0 w-full flex-1 items-stretch gap-3 px-3 pb-2 tablet:px-4 desktop:px-5 desktop:pb-3">
            {/* Contenedor del visor CAD unificado con shadow-xs */}
            <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-muted/30 shadow-xs backdrop-blur-[2px]">
              {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Spinner size={32} className="text-muted-foreground" />
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
          <div className="absolute inset-x-0 bottom-0 top-0 mx-2 mb-2 overflow-hidden rounded-xl bg-zinc-100 shadow-xs dark:bg-neutral-950">
            <div className="absolute inset-0 overflow-hidden">
              {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Spinner size={32} className="text-muted-foreground" />
                </div>
              )}
              <DxfViewer
                geometry={geometry}
                onGeometryChange={handleGeometryChange}
                onSendToAI={(ent) => setSelectedForAI(ent)}
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        )}

        <Dialog
          open={isMobileLayout && isMobilePanelOpen}
          onOpenChange={(open) => setIsMobilePanelOpen(open)}
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
