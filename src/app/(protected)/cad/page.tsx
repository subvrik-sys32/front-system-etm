"use client"

import { useState } from "react"
import { Boxes, SlidersHorizontal, Sparkles } from "lucide-react"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageToolbar } from "@/shared/responsive/navigation/hooks/use-page-toolbar"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { CadWorkspacePanel } from "@/features/cad/components/cad-workspace-panel"
import { CadAiPanel } from "@/features/cad-ai/components/cad-ai-panel"
import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"
import { cn } from "@/shared/utils/utils"

type Tab = "ai" | "templates"

export default function CadPage() {
  usePageTitle("CAD")
  const { isMobile } = useResponsive()
  const [tab, setTab] = useState<Tab>("ai")
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [hasAiChat, setHasAiChat] = useState(false)

  function TabsNav({ compact = false }: { compact?: boolean }) {
    return (
      <EntityToggle
        value={tab}
        onChange={setTab}
        aria-label="Vista CAD"
        compact={compact}
        options={[
          { value: "ai" as const, label: "IA", icon: Sparkles },
          { value: "templates" as const, label: "Plantillas", icon: Boxes },
        ]}
      />
    )
  }

  usePageToolbar(isMobile ? null : <TabsNav />)

  return (
    <PageShell mode={isMobile ? "fill" : "bleed"}>
      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        {isMobile ? (
          <div className="relative mb-1.5 flex h-11 shrink-0 items-center justify-center px-2">
            <TabsNav compact />
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
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "ai" ? (
            <CadAiPanel
              embedded
              mobilePanelOpen={aiPanelOpen}
              onMobilePanelOpenChange={setAiPanelOpen}
              onHasChatChange={setHasAiChat}
            />
          ) : (
            <CadWorkspacePanel embedded />
          )}
        </div>
      </section>
    </PageShell>
  )
}
