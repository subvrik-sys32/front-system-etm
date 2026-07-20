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

import { VerticalScroll } from "@/shared/ui/vertical-scroll/vertical-scroll"

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

    <VerticalScroll
      containerClassName="min-h-0 flex-1"
      className={cn(
        "overflow-x-hidden scrollbar-gutter-stable",
        isDrawer ? "px-2 py-4" : "px-3 py-3",
      )}
      arrowAlign="center"
      arrowClassName="bg-[#18181b]/5 backdrop-blur-md"
    >

      {!isDrawer && (

        <div className={collapsed ? "mb-3 flex justify-end" : "mb-3"}>
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
                    onTouchStart={
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

    </VerticalScroll>

  )

}