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

type Tab = "ai" | "templates"

/**
 * CAD = superficie fill-height (lienzo + panel), no lista.
 * Inset del chrome: PageShell mode="fill" (SSOT).
 */
export default function CadPage() {
  usePageTitle("CAD")
  const { isMobile } = useResponsive()
  const [tab, setTab] = useState<Tab>("ai")

  function TabsNav({ compact }: { compact: boolean }) {
    return (
      <nav
        className={cn(
          "flex items-center gap-1 rounded-xl bg-muted/60 p-1 dark:bg-muted/80",
          compact && "w-full",
        )}
      >
        {(
          [
            { id: "ai" as const, label: "IA", icon: Sparkles },
            { id: "templates" as const, label: "Plantillas", icon: Boxes },
          ] as const
        ).map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors",
                compact ? "flex-1 px-3 py-2" : "shrink-0 px-3 py-1.5",
                active
                  ? "bg-foreground/15 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>
    )
  }

  usePageToolbar(isMobile ? null : <TabsNav compact={false} />)

  return (
    <PageShell mode="fill">
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