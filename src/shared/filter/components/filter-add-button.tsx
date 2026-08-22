"use client"

import { forwardRef } from "react"
import { Funnel } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { FabTrigger } from "@/shared/ui/speed-dial-fab/fab-trigger"
import {
  TOOLBAR_CHROME_ICON_BTN,
  TOOLBAR_CHROME_ICON_BTN_ACTIVE,
  TOOLBAR_CHROME_ICON_SIZE,
} from "@/shared/ui/entity-toolbar/toolbar-chrome"

type Props = {
  expanded?: boolean
  active?: boolean
  /**
   * Solo afecta mobile FAB: ring vía FabTrigger mientras haya chips.
   * Desktop topbar no usa ring.
   */
  hasActiveFilters?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const FilterAddButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      expanded: _expanded,
      active = false,
      hasActiveFilters = false,
      className,
      ...props
    },
    ref,
  ) => {
    const { isMobile } = useResponsive()

    // Solo FAB móvil: ring de selección mientras hay filtros (FabTrigger).
    if (isMobile) {
      return (
        <FabTrigger
          ref={ref}
          icon={Funnel}
          label="FILTROS"
          active={active || hasActiveFilters}
          className={className}
          {...props}
        />
      )
    }

    // Desktop / topbar: chrome normal (sin ring de FAB).
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Filtros"
        title="Filtros"
        className={cn(
          TOOLBAR_CHROME_ICON_BTN,
          (active || hasActiveFilters) && TOOLBAR_CHROME_ICON_BTN_ACTIVE,
          className,
        )}
        {...props}
      >
        <Funnel size={TOOLBAR_CHROME_ICON_SIZE} strokeWidth={2.25} />
      </button>
    )
  },
)

FilterAddButton.displayName = "FilterAddButton"
