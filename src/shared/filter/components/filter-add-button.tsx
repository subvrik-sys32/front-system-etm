"use client"

import {
  forwardRef,
} from "react"

import {
  Funnel,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

import {
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"

import {
  FabTrigger,
} from "@/shared/ui/speed-dial-fab/fab-trigger"

import {
  TOOLBAR_CHROME_ICON_BTN,
  TOOLBAR_CHROME_ICON_BTN_ACTIVE,
  TOOLBAR_CHROME_ICON_SIZE,
} from "@/shared/ui/entity-toolbar/toolbar-chrome"

type Props={
  expanded?:boolean
  active?:boolean
  /**
   * true = hay chips activos. Solo afecta el look en mobile (FAB):
   * el círculo se pinta distinto para que se note DENTRO de la
   * lista del FAB que hay filtros aplicados, no solo arriba al lado
   * de la lupa. Vuelve a verse neutro en cuanto chips.length llega
   * a 0 (se borra el último filtro) — sin estado propio de "visto".
   */
  hasActiveFilters?:boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const FilterAddButton=
  forwardRef<
    HTMLButtonElement,
    Props
  >(
    (
      {
        expanded:_expanded,
        active=false,
        hasActiveFilters=false,
        className,
        ...props
      },
      ref
    )=>{

      const { isMobile } = useResponsive()

      // Mobile (fila del FAB): se actualiza accentClassName para que coincida 
      // exactamente con el estilo de la burbuja verde del history button.
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
    }
  )

FilterAddButton.displayName=
  "FilterAddButton"