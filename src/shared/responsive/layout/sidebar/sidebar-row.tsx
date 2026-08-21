"use client"

import React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/utils/utils"

/** Burbuja de contador del sidebar — usar en campana, historial, etc. */
export const SIDEBAR_COUNT_BADGE =
  "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"

/** Contador de alerta (notificaciones / mensajes). */
export const ALERT_COUNT_BADGE =
  "bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-red-300"

export const SIDEBAR_COUNT_BADGE_CLASS = cn(
  "flex items-center justify-center rounded-full font-bold leading-none shadow-xs select-none",
  SIDEBAR_COUNT_BADGE,
)

export type SidebarRowProps = React.HTMLAttributes<HTMLDivElement> & {
  icon: LucideIcon
  label: string
  collapsed?: boolean
  active?: boolean
  count?: number | string
  badgeColor?: string
  collapsedBadgeColor?: string
  badgeAnimated?: boolean
  isDrawer?: boolean
  size?: "sm" | "md"
}

export function SidebarRow({
  icon: Icon,
  label,
  collapsed = false,
  active = false,
  count,
  badgeColor = SIDEBAR_COUNT_BADGE,
  collapsedBadgeColor,
  badgeAnimated = false,
  isDrawer = false,
  size = "md",
  className,
  ...props
}: SidebarRowProps) {
  const hasCount = count !== undefined && count !== null && count !== ""

  return (
    <div
      className={cn(
        "group relative flex w-full items-center rounded-xl font-medium transition-all duration-150 select-none",
        size === "sm" ? "h-9 text-xs" : "h-10 text-xs",
        active
          ? "bg-primary/10 text-primary font-semibold shadow-xs dark:bg-primary/15 dark:text-white"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        collapsed && !isDrawer ? "justify-center px-0" : "px-3",
        className
      )}
      {...props}
    >
      {/* Contenedor del Icono */}
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors",
            active ? "text-primary dark:text-white" : "text-muted-foreground group-hover:text-foreground"
          )}
          strokeWidth={active ? 2.25 : 2}
        />

        {/* Badge / Contador flotante en modo COLAPSADO */}
        {collapsed && !isDrawer && hasCount && (
          <span
            className={cn(
              "absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none shadow-xs pointer-events-none",
              collapsedBadgeColor || badgeColor,
              badgeAnimated && "animate-pulse"
            )}
          >
            {count}
          </span>
        )}
      </div>

      {/* Contenido en modo EXPANDIDO / DRAWER */}
      {(!collapsed || isDrawer) && (
        <div className="ml-2.5 flex flex-1 items-center justify-between min-w-0">
          <span className="truncate">{label}</span>

          {hasCount && (
            <span
              className={cn(
                "ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none shadow-xs transition-all",
                badgeColor,
                badgeAnimated && "animate-pulse"
              )}
            >
              {count}
            </span>
          )}
        </div>
      )}
    </div>
  )
}