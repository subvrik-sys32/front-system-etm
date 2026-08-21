"use client"

import { useState } from "react"
import { Sparkles, Boxes } from "lucide-react"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageActions } from "@/shared/responsive/navigation/hooks/use-page-actions"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import {
  TOP_BAR_HEIGHT_PX,
  BOTTOM_NAV_HEIGHT_PX,
} from "@/shared/responsive/layout/chrome-constants"
import { CadWorkspacePanel } from "@/features/cad/components/cad-workspace-panel"
import { CadAiPanel } from "@/features/cad-ai/components/cad-ai-panel"
import { cn } from "@/shared/utils/utils"

type Tab = "ai" | "templates"

/**
 * CAD = superficie fill-height (lienzo + panel), no lista.
 * Mismo contrato que engineering en vista procesos:
 * NO AppListScroll — el panel es dueño del alto y del scroll interno.
 * Mobile: padding TopBar + BottomNav en el shell del panel.
 */
export default function CadPage() {
  usePageTitle("CAD")
  // Tabs desktop van en chrome vía header residual; mobile ya tiene TabsNav.
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

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-background px-3 pt-0 pb-2 text-foreground select-none tablet:px-4 desktop:px-5 desktop:pt-1 desktop:pb-3">

      {/* Shell fill-height — chrome mobile como engineering board */}
      <section
        className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
        style={
          isMobile
            ? {
                paddingTop: TOP_BAR_HEIGHT_PX,
                paddingBottom: `calc(${BOTTOM_NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
              }
            : undefined
        }
      >
        {/* Tabs mobile */}
        <div className="mb-2 shrink-0 desktop:hidden">
          <TabsNav compact />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "ai" ? <CadAiPanel embedded /> : <CadWorkspacePanel embedded />}
        </div>
      </section>
    </main>
  )
}
