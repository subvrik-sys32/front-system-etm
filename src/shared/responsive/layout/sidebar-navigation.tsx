"use client"

import { Fragment } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { NAVIGATION } from "./navigation"
import { getNavItemMeta } from "./sidebar-nav-item-meta"
import { SidebarItem } from "./sidebar-item"
import { SidebarPresence } from "./sidebar-presence"
import { SidebarSection } from "./sidebar-section"

import { cn } from "@/shared/utils/utils"

import { NotificationBell } from "@/features/notifications/components/notification-bell"

import { usePermissions } from "@/features/permissions/hooks/use-permissions"

import type { ProcessCounts } from "./hooks/use-sidebar-counts"

type SidebarNavigationProps = {
  collapsed?: boolean
  // Cuando es true (drawer mobile), no se renderiza la campana de
  // notificaciones acá — esa variante vive en el TopBar (Sprint 14)
  // para no duplicarla en dos lugares a la vez.
  isDrawer?: boolean
  projectsCount: number
  activeTasksCount: number
  processCounts: ProcessCounts
  presenceCollapsed: boolean
  presenceRef?: (node: HTMLDivElement | null) => void
  prefetchOnHover?: (href: string) => void
}

export function SidebarNavigation({
  collapsed,
  isDrawer = false,
  projectsCount,
  activeTasksCount,
  processCounts,
  presenceCollapsed,
  presenceRef,
  prefetchOnHover,
}: SidebarNavigationProps) {

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { has } = usePermissions()

  return (

    <div
      className={cn(
        "min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-gutter-stable",
        isDrawer ? "hide-scrollbar px-2 py-4" : "erp-scrollbar px-3 py-3",
      )}
      style={{
        maskImage:
          "linear-gradient(to bottom,transparent,black 4px,black calc(100% - 4px),transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom,transparent,black 4px,black calc(100% - 4px),transparent)",
      }}
    >

      {!isDrawer && (

        <div className={collapsed ? "mb-3 flex justify-center" : "mb-3"}>
          <NotificationBell collapsed={collapsed} />
        </div>

      )}

      {NAVIGATION.map((section, index) => {

        const items = section.items.filter(
          item =>
            !("permission" in item) ||
            has(item.permission),
        )

        if (items.length === 0) {
          return null
        }

        return (

          <Fragment key={section.title}>

            <SidebarSection
              title={section.title}
              collapsed={collapsed}
              isDrawer={isDrawer}
            >

              {items.map(item => {

                const {
                  isActive,
                  count,
                } = getNavItemMeta({
                  item,
                  pathname,
                  searchParams,
                  projectsCount,
                  activeTasksCount,
                  processCounts,
                })

                // Las rutas con query param (/processes?code=...)
                // no se prefetchean al montar el sidebar — recién
                // se prefetchean al pasar el mouse por encima.
                const hasQuery =
                  item.href.includes("?")

                return (

                  <SidebarItem
                    key={item.href}
                    collapsed={collapsed}
                    isDrawer={isDrawer}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActive}
                    count={count}
                    onMouseEnter={
                      hasQuery
                        ? () => prefetchOnHover?.(item.href)
                        : undefined
                    }
                  />

                )

              })}

            </SidebarSection>

            {index === NAVIGATION.length - 1 && (

              <SidebarPresence
                collapsed={presenceCollapsed}
                presenceRef={presenceRef}
              />

            )}

          </Fragment>

        )

      })}

    </div>

  )

}