"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { getBadgeColors } from "@/shared/utils/badge-colors"
import { cn } from "@/shared/utils/utils"

import { useDragScroll } from "@/shared/ui/horizontal-scroll/use-drag-scroll"
import { useHorizontalFade } from "@/shared/hooks/use-horizontal-fade"

import { PIPELINE_PROCESS_ORDER } from "../utils/process-columns"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

type Props = {
  value: ProcessCode
  onChange: (code: ProcessCode) => void
  columns: Map<ProcessCode, Task[]>
}

// Mismo lenguaje visual que el carrusel de KPIs: un ítem a pantalla
// completa por vez, con snap y flechas — antes eran pills chicas
// mostrando varias a la vez, difícil de leer y de tocar con precisión.
export function PipelineProcessSelector({
  value,
  onChange,
  columns,
}: Props) {

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleClickCapture,
    stopDragging,
  } = useDragScroll()

  const { leftFade, rightFade } = useHorizontalFade({ containerRef })

  const updateArrows = useCallback(() => {

    const el = containerRef.current

    if (!el) {
      return
    }

    setCanScrollLeft(el.scrollLeft > 4)

    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    )

  }, [containerRef])

  useEffect(() => {

    const el = containerRef.current

    if (!el) {
      return
    }

    updateArrows()

    el.addEventListener("scroll", updateArrows, { passive: true })

    const observer = new ResizeObserver(updateArrows)

    observer.observe(el)

    return () => {

      el.removeEventListener("scroll", updateArrows)
      observer.disconnect()

    }

  }, [updateArrows, containerRef])

  function scrollLeft() {

    const el = containerRef.current

    el?.scrollBy({
      left: -el.clientWidth,
      behavior: "smooth",
    })

  }

  function scrollRight() {

    const el = containerRef.current

    el?.scrollBy({
      left: el.clientWidth,
      behavior: "smooth",
    })

  }

  // Mantiene el ítem activo centrado en el viewport del carrusel
  // cuando cambia desde afuera (ej. al tocar la flecha del pipeline
  // board, no solo al swipear acá mismo).
  useEffect(() => {

    const el = containerRef.current

    if (!el) {
      return
    }

    const index = PIPELINE_PROCESS_ORDER.indexOf(value)

    if (index < 0) {
      return
    }

    const target = index * el.clientWidth

    if (Math.abs(el.scrollLeft - target) > 4) {
      el.scrollTo({ left: target, behavior: "smooth" })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (

    <div className="relative h-12 w-full">

      <button
        type="button"
        onClick={scrollLeft}
        aria-label="Proceso anterior"
        tabIndex={-1}
        className={cn(
          "absolute left-1 top-1/2 z-20 -translate-y-1/2",
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft size={15} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={scrollRight}
        aria-label="Proceso siguiente"
        tabIndex={-1}
        className={cn(
          "absolute right-1 top-1/2 z-20 -translate-y-1/2",
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight size={15} strokeWidth={2.5} />
      </button>

      <div
        style={{
          WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${leftFade}px, black calc(100% - ${rightFade}px), transparent 100%)`,
          maskImage: `linear-gradient(to right, transparent 0, black ${leftFade}px, black calc(100% - ${rightFade}px), transparent 100%)`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
        className="h-full overflow-hidden"
      >

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onClickCapture={handleClickCapture}
          className="hide-scrollbar flex h-full snap-x snap-mandatory items-center overflow-x-auto overflow-y-hidden overscroll-contain scroll-smooth cursor-grab select-none active:cursor-grabbing"
        >

          {PIPELINE_PROCESS_ORDER.map(code => {

            const definition = PROCESS_DEFINITIONS[code]
            const Icon = ENTITY_ICONS[definition.icon]
            const badge = getBadgeColors(definition.color, "subtle")
            const count = columns.get(code)?.length ?? 0
            const isActive = code === value

            return (

              <button
                key={code}
                type="button"
                onClick={() => onChange(code)}
                className={cn(
                  "flex h-10 w-full shrink-0 snap-center items-center justify-center gap-2 rounded-xl border px-3 transition",
                  isActive
                    ? "border-transparent bg-white/5"
                    : "border-transparent opacity-50",
                )}
              >

                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                  style={{ color: badge.text, backgroundColor: badge.background }}
                >
                  {code}
                </span>

                {Icon && (
                  <Icon size={15} className="shrink-0" style={{ color: definition.color }} />
                )}

                <span className="truncate text-sm font-bold uppercase tracking-wide text-neutral-200">
                  {definition.label}
                </span>

                <span className="shrink-0 text-xs font-semibold text-neutral-500">
                  {count}
                </span>

              </button>

            )

          })}

        </div>

      </div>

    </div>

  )

}