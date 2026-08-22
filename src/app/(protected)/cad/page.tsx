"use client"

import { useState } from "react"
import { Sparkles, Boxes } from "lucide-react"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageToolbar } from "@/shared/responsive/navigation/hooks/use-page-toolbar"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PageShell } from "@/shared/responsive/layout/page-shell"
import { CadWorkspacePanel } from "@/features/cad/components/cad-workspace-panel"
import { CadAiPanel } from "@/features/cad-ai/components/cad-ai-panel"
import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"

type Tab = "ai" | "templates"

/**
 * CAD = superficie fill-height (lienzo + panel), no lista.
 * Inset del chrome: PageShell mode="fill" (SSOT, mismo que nesting desktop).
 */
export default function CadPage() {
  usePageTitle("CAD")
  const { isMobile } = useResponsive()
  const [tab, setTab] = useState<Tab>("ai")

  function TabsNav() {
    return (
      <EntityToggle
        value={tab}
        onChange={setTab}
        aria-label="Vista CAD"
        options={[
          { value: "ai" as const, label: "IA", icon: Sparkles },
          { value: "templates" as const, label: "Plantillas", icon: Boxes },
        ]}
      />
    )
  }

  usePageToolbar(isMobile ? null : <TabsNav />)

  return (
    <PageShell mode="fill">
      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        {isMobile ? (
          <div className="mb-2 flex shrink-0 justify-center px-1">
            <TabsNav />
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "ai" ? <CadAiPanel embedded /> : <CadWorkspacePanel embedded />}
        </div>
      </section>
    </PageShell>
  )
}