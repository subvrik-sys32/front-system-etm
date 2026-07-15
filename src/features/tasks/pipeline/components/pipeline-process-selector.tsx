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

const SCROLL_STEP = 160

type Props = {
  value: ProcessCode
  onChange: (code: ProcessCode) => void
  columns: Map<ProcessCode, Task[]>
}

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

    setCanScrollLeft(el.scrollLeft > 0)

    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 1
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

    containerRef.current?.scrollBy({
      left: -SCROLL_STEP,
      behavior: "smooth",
    })

  }

  function scrollRight() {

    containerRef.current?.scrollBy({
      left: SCROLL_STEP,
      behavior: "smooth",
    })

  }

  return (

    <div className="relative h-12 w-full">

      <button
        type="button"
        onClick={scrollLeft}
        aria-label="Scrollear izquierda"
        tabIndex={-1}
        className={cn(
          "absolute left-1 top-1/2 z-20 -translate-y-1/2",
          "flex h-7 w-8 items-center justify-center rounded-lg",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft size={13} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={scrollRight}
        aria-label="Scrollear derecha"
        tabIndex={-1}
        className={cn(
          "absolute right-1 top-1/2 z-20 -translate-y-1/2",
          "flex h-7 w-8 items-center justify-center rounded-lg",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight size={13} strokeWidth={2.5} />
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
          className="hide-scrollbar flex h-full items-center gap-2 overflow-x-auto overflow-y-hidden overscroll-contain px-1 cursor-grab active:cursor-grabbing select-none"
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
                  "flex h-9 min-w-0 shrink-0 items-center gap-2 rounded-lg border px-2.5 transition",
                  isActive
                    ? "border-transparent bg-white/5"
                    : "border-transparent opacity-50",
                )}
              >

                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                  style={{ color: badge.text, backgroundColor: badge.background }}
                >
                  {code}
                </span>

                {Icon && (
                  <Icon size={13} className="shrink-0" style={{ color: definition.color }} />
                )}

                <span className="max-w-24 truncate text-xs font-bold uppercase tracking-wide text-neutral-200">
                  {definition.label}
                </span>

                <span className="shrink-0 text-[10px] font-semibold text-neutral-500">
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