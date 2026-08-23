"use client"

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react"
import { Boxes, Layers, SlidersHorizontal, Sparkles } from "lucide-react"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageToolbar } from "@/shared/responsive/navigation/hooks/use-page-toolbar"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { CadWorkspacePanel } from "@/features/cad/components/cad-workspace-panel"
import { CadAiPanel } from "@/features/cad-ai/components/cad-ai-panel"
import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"
import { TOPBAR_ICON_BTN } from "@/shared/ui/entity-toolbar/toolbar-chrome"
import { cn } from "@/shared/utils/utils"

type Tab = "ai" | "templates"

function CadTabs({
  tab,
  onTabChange,
  compact = false,
  iconsOnly = false,
}: {
  tab: Tab
  onTabChange: (t: Tab) => void
  compact?: boolean
  iconsOnly?: boolean
}) {
  return (
    <EntityToggle
      value={tab}
      onChange={onTabChange}
      aria-label="Vista CAD"
      compact={compact}
      iconsOnly={iconsOnly}
      options={[
        { value: "ai" as const, label: "IA", icon: Sparkles },
        { value: "templates" as const, label: "Plantillas", icon: Boxes },
      ]}
    />
  )
}

/** Botón redondo topbar (mismo chrome que campana / mensajes / avatar). */
function TopbarRoundButton({
  onClick,
  label,
  title,
  children,
}: {
  onClick: () => void
  label: string
  title?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      onClick={onClick}
      className={cn(TOPBAR_ICON_BTN, "shrink-0")}
    >
      {children}
    </button>
  )
}

/**
 * Móvil + tablet: slot immersive (AppShell ya recorta top bajo el TopBar).
 * Landscape: Skills → toggle → settings en TopBar (fade al rotar a portrait).
 * Portrait: fila bajo el slot; Skills/settings a la derecha.
 */
function CadPageCompact() {
  usePageTitle("CAD")
  const { isLandscape } = useResponsive()
  const [tab, setTab] = useState<Tab>("ai")
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [hasVisualizer, setHasVisualizer] = useState(false)
  const openSkillsRef = useRef<(() => void) | null>(null)
  const registerOpenSkills = useCallback((open: () => void) => {
    openSkillsRef.current = open
  }, [])

  const openSkills = useCallback(() => openSkillsRef.current?.(), [])

  // Siempre montado para poder animar opacity al rotar; en portrait queda invisible.
  const chromeToolbar = useMemo(
    () => (
      <div
        className={cn(
          "flex items-center gap-1 overflow-hidden transition-[opacity,max-width,margin] duration-300 ease-out",
          isLandscape
            ? "max-w-[24rem] opacity-100"
            : "pointer-events-none max-w-0 opacity-0",
        )}
        aria-hidden={!isLandscape}
      >
        {/* Orden: Skills primero, luego toggle */}
        {tab === "ai" && (
          <TopbarRoundButton onClick={openSkills} label="Skills" title="Skills">
            <Layers size={16} strokeWidth={2.2} />
          </TopbarRoundButton>
        )}
        <CadTabs tab={tab} onTabChange={setTab} compact iconsOnly />
        {tab === "ai" && hasVisualizer && (
          <TopbarRoundButton
            onClick={() => setAiPanelOpen(true)}
            label="Opciones de IA"
            title="Opciones de IA"
          >
            <SlidersHorizontal size={16} strokeWidth={2.2} />
          </TopbarRoundButton>
        )}
      </div>
    ),
    [isLandscape, tab, openSkills, hasVisualizer],
  )

  usePageToolbar(chromeToolbar)

  return (
    <PageShell mode="bleed">
      {/* overflow-hidden: nada se dibuja bajo el TopBar (el slot immersive ya recorta) */}
      <section className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        {!isLandscape && (
          <div className="relative z-[1] mb-1.5 flex h-11 shrink-0 items-center overflow-visible px-2">
            <div className="flex min-w-0 flex-1 items-center justify-center">
              <CadTabs tab={tab} onTabChange={setTab} compact />
            </div>

            {tab === "ai" && (
              <div className="absolute right-2 top-1/2 z-[2] flex -translate-y-1/2 items-center gap-1.5">
                <TopbarRoundButton onClick={openSkills} label="Skills" title="Skills">
                  <Layers size={16} strokeWidth={2.2} />
                </TopbarRoundButton>
                {hasVisualizer && (
                  <TopbarRoundButton
                    onClick={() => setAiPanelOpen(true)}
                    label="Opciones de IA"
                    title="Opciones de IA"
                  >
                    <SlidersHorizontal size={16} strokeWidth={2.2} />
                  </TopbarRoundButton>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "ai" ? (
            <CadAiPanel
              layout="mobile"
              mobilePanelOpen={aiPanelOpen}
              onMobilePanelOpenChange={setAiPanelOpen}
              onHasVisualizerChange={setHasVisualizer}
              onRegisterOpenSkills={registerOpenSkills}
            />
          ) : (
            <CadWorkspacePanel layout="mobile" />
          )}
        </div>
      </section>
    </PageShell>
  )
}

function CadPageDesktop() {
  usePageTitle("CAD")
  const [tab, setTab] = useState<Tab>("ai")
  const openSkillsRef = useRef<(() => void) | null>(null)
  const registerOpenSkills = useCallback((open: () => void) => {
    openSkillsRef.current = open
  }, [])

  usePageToolbar(
    <div className="flex items-center gap-1.5">
      {/* Skills primero, luego toggle */}
      {tab === "ai" && (
        <TopbarRoundButton
          onClick={() => openSkillsRef.current?.()}
          label="Skills"
          title="Skills"
        >
          <Layers size={16} strokeWidth={2.2} />
        </TopbarRoundButton>
      )}
      <CadTabs tab={tab} onTabChange={setTab} />
    </div>,
  )

  return (
    <PageShell mode="bleed">
      <section className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "ai" ? (
            <CadAiPanel layout="desktop" onRegisterOpenSkills={registerOpenSkills} />
          ) : (
            <CadWorkspacePanel layout="desktop" />
          )}
        </div>
      </section>
    </PageShell>
  )
}

export default function CadPage() {
  const { isMobile, isCompact, ready } = useResponsive()

  if (!ready) {
    return <div className="min-h-0 flex-1" />
  }

  const compactChrome = isMobile || isCompact
  return compactChrome ? <CadPageCompact /> : <CadPageDesktop />
}
