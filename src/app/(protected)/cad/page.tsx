"use client"

import { useState } from "react"
import { Sparkles, Boxes } from "lucide-react"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageToolbar } from "@/shared/responsive/navigation/hooks/use-page-toolbar"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { CadWorkspacePanel } from "@/features/cad/components/cad-workspace-panel"
import { CadAiPanel } from "@/features/cad-ai/components/cad-ai-panel"
import { cn } from "@/shared/utils/utils"
import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"

type Tab = "ai" | "templates"

/**
 * CAD = superficie fill-height (lienzo + panel), no lista.
 * Inset del chrome: PageShell mode="bleed" (SSOT).
 */
export default function CadPage() {
  usePageTitle("CAD")
  const { isMobile } = useResponsive()
  const [tab, setTab] = useState<Tab>("ai")

  function TabsNav({ compact }: { compact: boolean }) {
    return (
      <EntityToggle
        value={tab}
        onChange={setTab}
        compact={compact}
        aria-label="Vista CAD"
        className={cn(compact && "w-full justify-center")}
        options={[
          { value: "ai" as const, label: "IA", icon: Sparkles },
          { value: "templates" as const, label: "Plantillas", icon: Boxes },
        ]}
      />
    )
  }

  usePageToolbar(isMobile ? null : <TabsNav compact={false} />)

  return (
    <PageShell mode="bleed">
      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        {/* Solo mobile: en tablet/desktop viven en DesktopTopBar vía usePageToolbar */}
        {isMobile ? (
          <div className="mb-2 shrink-0">
            <TabsNav compact />
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "ai" ? <CadAiPanel embedded /> : <CadWorkspacePanel embedded />}
        </div>
      </section>
    </PageShell>
  )
}