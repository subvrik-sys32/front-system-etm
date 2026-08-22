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

  return (
    <div
      className={cn(
        "group relative flex w-full items-center rounded-xl font-medium select-none pl-1.5 pr-2",
        size === "sm" ? "h-8 text-xs" : "h-9 text-xs",
        active
          ? "bg-primary/10 text-primary font-semibold shadow-xs dark:bg-primary/15 dark:text-white"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className,
      )}
      title={isRail ? label : undefined}
      {...props}
    >
      <div className={cn("relative flex shrink-0 items-center justify-center", cell)}>
        <Icon
          className={cn(
            "size-4 shrink-0",
            active
              ? "text-primary dark:text-white"
              : "text-muted-foreground group-hover:text-foreground",
          )}
          strokeWidth={active ? 2.25 : 2}
        />

        {/* Badge sobre el icono: SOLO se muestra si hay count Y estamos en modo rail */}
        {hasCount && isRail && (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none shadow-xs pointer-events-none transition-opacity duration-150 opacity-100",
              collapsedBadgeColor || badgeColor,
              badgeAnimated && "animate-pulse",
            )}
          >
            {count}
          </span>
        )}
      </div>

      <div
        aria-hidden={isRail}
        className={cn(
          "ml-2 flex min-w-0 flex-1 items-center justify-between gap-1 overflow-hidden transition-opacity duration-150",
          isRail ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <span className="block min-w-0 flex-1 truncate whitespace-nowrap overflow-hidden">{label}</span>
        
        {/* Badge lateral al texto: SOLO se muestra si hay count Y NO estamos en modo rail */}
        {hasCount && !isRail && (
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