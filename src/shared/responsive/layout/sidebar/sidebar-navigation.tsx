"use client"

import { useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { NAVIGATION } from "./navigation"
import { getNavItemMeta } from "./sidebar-nav-item-meta"
import { SidebarItem } from "./sidebar-item"
import { SidebarPresence } from "./sidebar-presence"
import { SidebarSection } from "./sidebar-section"

import { cn } from "@/shared/utils/utils"
import { NotificationBell } from "@/features/notifications/components/notification-bell"
import { MessageBell } from "@/features/comments/components/message-bell"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProcessCounts } from "../hooks/use-sidebar-counts"

type SidebarNavigationProps = {
  collapsed?: boolean
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
  const userRoles = useAuthStore(state => state.user?.roles)

  const currentRoles = useMemo(
    () => userRoles?.map(role => role.code) ?? [],
    [userRoles],
  )

  return (
    <ScrollArea className="min-h-0 w-full flex-1">
      {/* 
        Aumentamos el padding superior (pt-3 o pt-4) para separar 
        visualmente los elementos del borde inferior del SidebarHeader.
      */}
      <div className={cn("w-full", isDrawer ? "px-2 pt-3 pb-3" : "px-2 pt-3 pb-2")}>
        {!isDrawer && (
          <>
            <div className="mb-1 w-full">
              <NotificationBell collapsed={collapsed} />
            </div>
            <div className="mb-2 w-full">
              <MessageBell collapsed={collapsed} />
            </div>
            <div className="mb-2 w-full">
              <SidebarPresence
                collapsed={presenceCollapsed}
                isDrawer={isDrawer}
                presenceRef={presenceRef}
              />
            </div>
          </>
        )}

        {NAVIGATION.map((section) => {
          const items = section.items.filter(item => {
            const byPermission = !("permission" in item) || has(item.permission as never)
            const byPermissions =
              !("permissions" in item) ||
              (item.permissions as readonly string[]).some(code => has(code as never))
            const byRoles =
              !("roles" in item) ||
              currentRoles.some(code => (item.roles as readonly string[]).includes(code))
            return byPermission && byPermissions && byRoles
          })

          if (items.length === 0) return null

          return (
            <SidebarSection
              key={section.title}
              title={section.title}
              collapsed={collapsed}
              isDrawer={isDrawer}
            >
              {items.map(item => {
                const { isActive, count } = getNavItemMeta({
                  item,
                  pathname,
                  searchParams,
                  projectsCount,
                  activeTasksCount,
                  processCounts,
                })

                const hasQuery = item.href.includes("?")

                return (
                  <div key={item.href} className="w-full">
                    <SidebarItem
                      collapsed={collapsed}
                      isDrawer={isDrawer}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive}
                      count={count}
                      onMouseEnter={hasQuery ? () => prefetchOnHover?.(item.href) : undefined}
                      onTouchStart={hasQuery ? () => prefetchOnHover?.(item.href) : undefined}
                    />
                  </div>
                )
              })}
            </SidebarSection>
          )
        })}
      </div>
    </ScrollArea>
  )
}