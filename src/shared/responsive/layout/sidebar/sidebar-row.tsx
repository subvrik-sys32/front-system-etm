"use client"

import React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/utils/utils"

export const SIDEBAR_COUNT_BADGE =
  "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"

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

/**
 * - Expandido / drawer: fila completa (icono + label + badge).
 * - Colapsado: solo celda size-9 centrada; hover/activo = rectángulo del icono.
 */
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
  const isRail = collapsed && !isDrawer
  const cell = size === "sm" ? "size-8" : "size-9"

  if (isRail) {
    return (
      <div
        className={cn(
          "relative mx-auto flex items-center justify-center rounded-xl select-none",
          cell,
          active
            ? "bg-primary/10 text-primary font-semibold shadow-xs dark:bg-primary/15 dark:text-white"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          className,
        )}
        title={label}
        {...props}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            active ? "text-primary dark:text-white" : "text-muted-foreground",
          )}
          strokeWidth={active ? 2.25 : 2}
        />
        {hasCount && (
          <span
            className={cn(
              "absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none shadow-xs pointer-events-none",
              collapsedBadgeColor || badgeColor,
              badgeAnimated && "animate-pulse",
            )}
          >
            {count}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative flex w-full items-center rounded-xl font-medium select-none px-2.5",
        size === "sm" ? "h-8 text-xs" : "h-9 text-xs",
        active
          ? "bg-primary/10 text-primary font-semibold shadow-xs dark:bg-primary/15 dark:text-white"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className,
      )}
      {...props}
    >
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        <Icon
          className={cn(
            "size-4 shrink-0",
            active
              ? "text-primary dark:text-white"
              : "text-muted-foreground group-hover:text-foreground",
          )}
          strokeWidth={active ? 2.25 : 2}
        />
      </div>

      <div className="ml-2 flex min-w-0 flex-1 items-center justify-between gap-1 overflow-hidden">
        <span className="block min-w-0 flex-1 truncate whitespace-nowrap overflow-hidden">{label}</span>
        {hasCount && (
          <span
            className={cn(
              "ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none shadow-xs",
              badgeColor,
              badgeAnimated && "animate-pulse",
            )}
          >
            {count}
          </span>
        )}
      </div>
    </div>
  )
}
