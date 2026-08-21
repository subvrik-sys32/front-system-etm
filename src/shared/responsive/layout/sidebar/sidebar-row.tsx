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

/** Ancho del rail de iconos (= sidebar colapsado). */
const ICON_RAIL = "w-[72px]"

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
  const labelsVisible = !collapsed || isDrawer

  return (
    <div
      className={cn(
        "group relative flex w-full items-center rounded-xl font-medium select-none",
        size === "sm" ? "h-8 text-xs" : "h-9 text-xs",
        active
          ? "bg-primary/10 text-primary font-semibold shadow-xs dark:bg-primary/15 dark:text-white"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {/* Rail fijo: el icono no se desplaza al colapsar */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          isDrawer ? "w-10 px-0" : ICON_RAIL,
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            active
              ? "text-primary dark:text-white"
              : "text-muted-foreground group-hover:text-foreground",
          )}
          strokeWidth={active ? 2.25 : 2}
        />

        {hasCount && (
          <span
            className={cn(
              "absolute -top-0.5 right-2 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none shadow-xs pointer-events-none transition-opacity duration-200",
              collapsedBadgeColor || badgeColor,
              badgeAnimated && labelsVisible === false && "animate-pulse",
              labelsVisible ? "opacity-0" : "opacity-100",
            )}
            aria-hidden={labelsVisible}
          >
            {count}
          </span>
        )}
      </div>

      {/* Texto + badge: solo fade, sin unmount */}
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between pr-2.5 transition-opacity duration-200",
          labelsVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <span className="truncate">{label}</span>
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
