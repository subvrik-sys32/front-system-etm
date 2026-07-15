"use client"

import type { ReactNode } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PipelineScroll } from "@/shared/ui/pipeline-scroll/pipeline-scroll"

type Props = {
  // Siempre visible, en ambos layouts (ej. botón "volver" + buscador).
  pinned?: ReactNode
  // Desktop: inline en fila. Mobile: en la MISMA fila con scroll
  // horizontal que el resto de las acciones — no una fila propia
  // (eso era lo que dejaba la lupa aislada arriba de Filtro/Manual/
  // Historial/Exportar).
  actions: ReactNode[]
  // Slot derecho de EntityToolbar (ej. TaskViewToggle en desktop).
  right?: ReactNode
}

export function AdaptiveActionBar({
  pinned,
  actions,
  right,
}: Props) {

  const { isMobile } = useResponsive()

  if (!isMobile) {

    return (

      <div className="flex flex-wrap items-center gap-2 py-1 select-none">

        {pinned}

        {actions.map((action, index) => (
          <div key={index} className="contents">
            {action}
          </div>
        ))}

        {right}

      </div>

    )

  }

  const hasScrollRow =
    Boolean(pinned) || actions.length > 0

  return (

    <div className="flex w-full flex-col gap-2 py-1 select-none">

      {hasScrollRow && (

        <div className="h-10 w-full">

          <PipelineScroll className="h-full items-center gap-2" fade drag>

            {pinned && (
              <div className="flex shrink-0 items-center gap-2">
                {pinned}
              </div>
            )}

            {actions.map((action, index) => (
              <div key={index} className="shrink-0">
                {action}
              </div>
            ))}

          </PipelineScroll>

        </div>

      )}

      {right}

    </div>

  )

}