"use client"

import { useQueryClient } from "@tanstack/react-query"

import { useState } from "react"
import { Layers, Wrench, ShieldCheck } from "lucide-react"

import { BitacoraDepartmentPage } from "@/features/activity-log/components/bitacora-department-page"
import { TeamActivityLogPageContent } from "@/features/activity-log/components/contents/team-activity-log-page-content"
import { BITACORA_DEPARTMENTS } from "@/features/activity-log/constants/bitacora-departments"
import type { ActivityDepartment } from "@/features/activity-log/types/activity-log.types"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { AppListScroll } from "@/shared/ui/vertical-scroll/app-list-scroll"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { usePageToolbar } from "@/shared/responsive/navigation/hooks/use-page-toolbar"
import { PageShell } from "@/shared/responsive/layout/page-shell"

type ViewMode = ActivityDepartment | "TEAM"

interface TabConfig {
  id: ViewMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  show: boolean
}

export default function BitacoraPage() {
  usePageTitle("Bitácora")
  const queryClient = useQueryClient()
  const { isCompact, isMobile } = useResponsive()

  const userRoles = useAuthStore(state => state.user?.roles)
  const { has } = usePermissions()

  const roleCodes = userRoles?.map(role => role.code) ?? []
  const isAdmin = roleCodes.includes("ADMIN")

  const canSeeProduccion =
    isAdmin ||
    BITACORA_DEPARTMENTS.PRODUCCION.roles.some(r => roleCodes.includes(r))
  const canSeeIngenieria =
    isAdmin ||
    BITACORA_DEPARTMENTS.INGENIERIA.roles.some(r => roleCodes.includes(r))
  const canSeeTeam = has(PermissionCode.ACTIVITY_LOG_READ_ANY)

  const tabs: TabConfig[] = [
    {
      id: "PRODUCCION" as ViewMode,
      label: "Producción",
      icon: Layers,
      show: canSeeProduccion,
    },
    {
      id: "INGENIERIA" as ViewMode,
      label: "Ingeniería",
      icon: Wrench,
      show: canSeeIngenieria,
    },
    {
      id: "TEAM" as ViewMode,
      label: "Equipo",
      icon: ShieldCheck,
      show: canSeeTeam,
    },
  ].filter(tab => tab.show)

  const [activeView, setActiveView] = useState<ViewMode>(() => {
    const firstAvailable = tabs.find(t => t.show)
    return firstAvailable ? firstAvailable.id : "PRODUCCION"
  })

  if (!userRoles) {
    return null
  }

  if (tabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
        <p>No tienes permisos para visualizar ninguna bitácora.</p>
      </div>
    )
  }

  function TabsNav({ compact }: { compact: boolean }) {
    return (
      <nav
        className={
          compact
            ? "flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-popover p-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
            : "flex items-center gap-1 rounded-xl bg-popover p-1"
        }
      >
        {tabs.map(tab => {
          const IconComponent = tab.icon
          const isActive = activeView === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              title={tab.label}
              className={
                compact
                  ? `flex flex-1 shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`
                  : `flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`
              }
            >
              <IconComponent className="h-4 w-4 shrink-0" />
              <span
                className={
                  compact ? "max-[420px]:hidden truncate" : "truncate"
                }
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  usePageToolbar(isMobile || isCompact ? null : <TabsNav compact={false} />)

  return (
    <PageShell mode={isCompact ? "list" : "fill"}>
      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        {isCompact ? (
          <AppListScroll>
            <div className="mt-2 mb-2 shrink-0">
              <TabsNav compact />
            </div>
            <div className="flex min-h-0 w-full flex-1 flex-col">
              {activeView === "PRODUCCION" && (
                <BitacoraDepartmentPage
                  config={BITACORA_DEPARTMENTS.PRODUCCION}
                  embedded
                />
              )}
              {activeView === "INGENIERIA" && (
                <BitacoraDepartmentPage
                  config={BITACORA_DEPARTMENTS.INGENIERIA}
                  embedded
                />
              )}
              {activeView === "TEAM" && (
                <TeamActivityLogPageContent embedded />
              )}
            </div>
          </AppListScroll>
        ) : (
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            {activeView === "PRODUCCION" && (
              <BitacoraDepartmentPage
                config={BITACORA_DEPARTMENTS.PRODUCCION}
                embedded
              />
            )}
            {activeView === "INGENIERIA" && (
              <BitacoraDepartmentPage
                config={BITACORA_DEPARTMENTS.INGENIERIA}
                embedded
              />
            )}
            {activeView === "TEAM" && (
              <TeamActivityLogPageContent embedded />
            )}
          </div>
        )}
      </section>
    </PageShell>
  )
}