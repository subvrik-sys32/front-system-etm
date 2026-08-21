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
  /** Acento del círculo FAB — clases de tema, no hex. */
  accentClassName?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">

/**
 * - Desktop: pastilla ícono + label.
 * - Mobile FAB: círculo neutro = bg-foreground / text-background (tema).
 */
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
            active && TOOLBAR_CHROME_ICON_BTN_ACTIVE,
            className,
          )}
          {...props}
        >
          <Icon size={TOOLBAR_CHROME_ICON_SIZE} strokeWidth={2.25} className="shrink-0" />
          {badge && (
            <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 z-[60]">
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
          "relative z-20 flex size-11 shrink-0 items-center justify-center overflow-visible rounded-full shadow-xs transition active:scale-95",
          accentClassName ??
            cn(
              "bg-foreground text-background",
              active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            ),
          className,
        )}
        {...props}
      >
        <Icon size={17} strokeWidth={2.2} />
        {badge && (
          <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 z-[60]">
            {badge}
          </span>
        )}
      </button>
    )
  },
)

FabTrigger.displayName = "FabTrigger"