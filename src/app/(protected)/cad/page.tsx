"use client"

import { useCallback, useRef, useState } from "react"
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
}: {
  tab: Tab
  onTabChange: (t: Tab) => void
  compact?: boolean
}) {
  return (
    <EntityToggle
      value={tab}
      onChange={onTabChange}
      aria-label="Vista CAD"
      compact={compact}
      options={[
        { value: "ai" as const, label: "IA", icon: Sparkles },
        { value: "templates" as const, label: "Plantillas", icon: Boxes },
      ]}
    />
  )
}

/**
 * Móvil + tablet (isCompact): una sola fila h-11 — toggle + Skills + settings.
 * Mismo patrón que Bitácora (chrome local bajo TopBar, sin toolbar de page).
 */
function CadPageCompact() {
  usePageTitle("CAD")
  const [tab, setTab] = useState<Tab>("ai")
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [hasAiChat, setHasAiChat] = useState(false)
  const openSkillsRef = useRef<(() => void) | null>(null)
  const registerOpenSkills = useCallback((open: () => void) => {
    openSkillsRef.current = open
  }, [])

  return (
    <PageShell mode="fill">
      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        {/* Una sola fila: no apilar Skills debajo del toggle */}
        <div className="relative mb-1.5 flex h-11 shrink-0 items-center px-2">
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <CadTabs tab={tab} onTabChange={setTab} compact />
            {tab === "ai" && (
              <button
                type="button"
                aria-label="Skills"
                title="Skills"
                onClick={() => openSkillsRef.current?.()}
                className={cn(
                  CHROME_ICON_BTN,
                  "h-9 w-auto shrink-0 gap-1.5 px-2.5 text-xs font-semibold shadow-xs backdrop-blur-xs",
                )}
              >
                <Layers size={14} strokeWidth={2.25} />
                <span className="max-[380px]:hidden">Skills</span>
              </button>
            )}
          </div>

          {tab === "ai" && hasAiChat && (
            <button
              type="button"
              aria-label="Abrir panel de IA"
              title="Opciones de IA"
              onClick={() => setAiPanelOpen(true)}
              className={cn(
                "absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center",
                "rounded-xl bg-foreground/5 text-foreground shadow-xs backdrop-blur-xl",
              )}
            >
              <SlidersHorizontal size={16} strokeWidth={2.2} />
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "ai" ? (
            <CadAiPanel
              layout="mobile"
              mobilePanelOpen={aiPanelOpen}
              onMobilePanelOpenChange={setAiPanelOpen}
              onHasChatChange={setHasAiChat}
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

/** Desktop / laptop: tabs en DesktopTopBar; Skills vive en el empty del panel. */
function CadPageDesktop() {
  usePageTitle("CAD")
  const [tab, setTab] = useState<Tab>("ai")

  usePageToolbar(<CadTabs tab={tab} onTabChange={setTab} />)

  return (
    <PageShell mode="bleed">
      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "ai" ? (
            <CadAiPanel layout="desktop" />
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

  // Bitácora: isMobile || isCompact → chrome local. CAD igual.
  const compactChrome = isMobile || isCompact
  return compactChrome ? <CadPageCompact /> : <CadPageDesktop />
}
