"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Boxes, Layers, SlidersHorizontal, Sparkles } from "lucide-react"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageToolbar } from "@/shared/responsive/navigation/hooks/use-page-toolbar"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { CadWorkspacePanel } from "@/features/cad/components/cad-workspace-panel"
import { CadAiPanel } from "@/features/cad-ai/components/cad-ai-panel"
import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"
import { CHROME_ICON_BTN } from "@/shared/ui/actions/icon-action"
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

function SkillsChromeButton({
  onClick,
  iconsOnly,
}: {
  onClick: () => void
  iconsOnly?: boolean
}) {
  return (
    <button
      type="button"
      aria-label="Skills"
      title="Skills"
      onClick={onClick}
      className={cn(
        CHROME_ICON_BTN,
        "shrink-0 shadow-xs backdrop-blur-xs",
        iconsOnly ? "size-8 px-0" : "h-9 w-auto gap-1.5 px-2.5 text-xs font-semibold",
      )}
    >
      <Layers size={14} strokeWidth={2.25} />
      {!iconsOnly && <span>Skills</span>}
    </button>
  )
}

/**
 * Móvil + tablet: slot immersive (entre TopBar y BottomNav).
 * Landscape: toggle + Skills van al TopBar (usePageToolbar).
 * Portrait: fila bajo el TopBar; Skills solo icono a la derecha.
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

  const landscapeToolbar = useMemo(() => {
    if (!isLandscape) return null
    return (
      <div className="flex items-center gap-1">
        <CadTabs tab={tab} onTabChange={setTab} compact iconsOnly />
        {tab === "ai" && (
          <SkillsChromeButton onClick={openSkills} iconsOnly />
        )}
      </div>
    )
  }, [isLandscape, tab, openSkills])

  usePageToolbar(landscapeToolbar)

  return (
    <PageShell mode="bleed">
      <section className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        {(!isLandscape || (tab === "ai" && hasVisualizer)) && (
          <div
            className={cn(
              "relative z-[1] flex shrink-0 items-center overflow-visible px-2",
              isLandscape ? "mb-0.5 min-h-8 py-0.5" : "mb-1.5 h-11",
            )}
          >
            {!isLandscape && (
              <div className="flex min-w-0 flex-1 items-center justify-center">
                <CadTabs tab={tab} onTabChange={setTab} compact />
              </div>
            )}

            {!isLandscape && tab === "ai" && (
              <button
                type="button"
                aria-label="Skills"
                title="Skills"
                onClick={openSkills}
                className={cn(
                  CHROME_ICON_BTN,
                  "absolute top-1/2 z-[2] flex size-9 -translate-y-1/2 px-0 shadow-xs backdrop-blur-xs",
                  hasVisualizer ? "right-12" : "right-2",
                )}
              >
                <Layers size={14} strokeWidth={2.25} />
              </button>
            )}

            {tab === "ai" && hasVisualizer && (
              <button
                type="button"
                aria-label="Abrir panel de IA"
                title="Opciones de IA"
                onClick={() => setAiPanelOpen(true)}
                className={cn(
                  "absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center",
                  "rounded-xl bg-foreground/5 text-foreground shadow-xs backdrop-blur-xl",
                  isLandscape ? "size-8" : "size-9",
                )}
              >
                <SlidersHorizontal size={isLandscape ? 15 : 16} strokeWidth={2.2} />
              </button>
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
      <CadTabs tab={tab} onTabChange={setTab} />
      {tab === "ai" && (
        <SkillsChromeButton
          onClick={() => openSkillsRef.current?.()}
          iconsOnly={false}
        />
      )}
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
