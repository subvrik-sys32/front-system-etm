"use client"

import type { ReactNode } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { PipelineScroll } from "@/shared/ui/pipeline-scroll/pipeline-scroll"

type Props = {
  // Siempre visible, en ambos layouts (ej. botón "volver" + buscador).
  pinned?: ReactNode
  // Desktop: inline en fila. Mobile: fila propia con scroll
  // horizontal — cada acción se muestra directa, sin envolverla
  // en un popover propio (eso fue lo que rompió el render antes).
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

  return (

    <div className="flex w-full flex-col gap-2 py-1 select-none">

      <div className="flex min-w-0 items-center gap-2">
        {pinned}
      </div>

      {actions.length > 0 && (

        <div className="h-10 w-full">

          <PipelineScroll className="h-full items-center gap-2" fade drag>

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