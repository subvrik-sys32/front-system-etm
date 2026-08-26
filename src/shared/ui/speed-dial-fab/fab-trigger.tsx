"use client"

import { forwardRef } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import {
  TOOLBAR_CHROME_ICON_BTN,
  TOOLBAR_CHROME_ICON_BTN_ACTIVE,
  TOOLBAR_CHROME_ICON_SIZE,
} from "@/shared/ui/entity-toolbar/toolbar-chrome"

type Props = {
  icon: LucideIcon
  label: string
  active?: boolean
  badge?: React.ReactNode
  accentClassName?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">

export const FAB_PLUS =
  "bg-fab-plus text-fab-plus-foreground shadow-xs"

/** Historial activo: mismo color de negocio que el FAB (no más claro). */
export const FAB_PLUS_ACTIVE =
  "bg-fab-plus text-fab-plus-foreground shadow-xs ring-2 ring-primary/50"

const FAB_ACTIVE = "bg-muted text-foreground"

export const FabTrigger = forwardRef<HTMLButtonElement, Props>(
  (
    {
      icon: Icon,
      label,
      active = false,
      badge,
      accentClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const { isMobile } = useResponsive()

    if (!isMobile) {
      return (
        <button
          ref={ref}
          type="button"
          title={label}
          aria-label={label}
          className={cn(
            TOOLBAR_CHROME_ICON_BTN,
            "relative z-20 overflow-visible",
            // Ring primary solo en FAB móvil — topbar usa chrome activo
            active && TOOLBAR_CHROME_ICON_BTN_ACTIVE,
            className,
          )}
          {...props}
        >
          <Icon size={TOOLBAR_CHROME_ICON_SIZE} strokeWidth={2.25} className="shrink-0" />
          {badge && (
            <span className="pointer-events-none absolute -right-1.5 -top-1.5 z-[60]">
              {badge}
            </span>
          )}
        </button>
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "relative z-20 flex size-11 shrink-0 items-center justify-center overflow-visible rounded-full shadow-xs",
          "bg-muted text-foreground",
          // sin hover:opacity / active:bg translucido / scale (no “corre”)
          accentClassName,
          active && FAB_ACTIVE,
          className,
        )}
        {...props}
      >
        <Icon size={17} strokeWidth={2.2} />
        {badge && (
          <span className="pointer-events-none absolute -right-1.5 -top-1.5 z-[60]">
            {badge}
          </span>
        )}
      </button>
    )
  },
)

FabTrigger.displayName = "FabTrigger"
