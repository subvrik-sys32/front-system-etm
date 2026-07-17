"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { getBadgeColors } from "@/shared/utils/badge-colors"

import { useSnapCarouselSync } from "@/shared/hooks/use-snap-carousel-sync"
import { useHorizontalFade } from "@/shared/hooks/use-horizontal-fade"

import { PIPELINE_PROCESS_ORDER } from "../../utils/process-columns"
import { TaskProcessColumn } from "../../table/task-process-column"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

type Props = {
  value: ProcessCode
  onChange: (code: ProcessCode) => void
  tasks: Task[]
  columns: Map<ProcessCode, Task[]>
  expandedKey: string | null
  onToggleCard: (key: string) => void
  activeOverlayKey: string | null
  onOverlayOpenChange: (key: string, isOpen: boolean) => void
}

export function MobilePipelineCarousel({
  value,
  onChange,
  tasks,
  columns,
  expandedKey,
  onToggleCard,
  activeOverlayKey,
  onOverlayOpenChange,
}: Props) {

  const { containerRef, scrollToPrevious, scrollToNext } =
    useSnapCarouselSync({
      value,
      onChange,
      order: PIPELINE_PROCESS_ORDER,
    })

  const { leftFade, rightFade } = useHorizontalFade({ containerRef })

  return (

    <div className="relative">

      <button
        type="button"
        onClick={scrollToPrevious}
        aria-label="Proceso anterior"
        tabIndex={-1}
        className="absolute left-1 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b]/80 text-neutral-200 backdrop-blur-xl"
      >
        <ChevronLeft size={15} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={scrollToNext}
        aria-label="Proceso siguiente"
        tabIndex={-1}
        className="absolute right-1 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b]/80 text-neutral-200 backdrop-blur-xl"
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
      >

        <div
          ref={containerRef}
          className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-contain scroll-smooth"
        >

          {PIPELINE_PROCESS_ORDER.map(code => {

            const definition = PROCESS_DEFINITIONS[code]
            const Icon = ENTITY_ICONS[definition.icon]
            const badge = getBadgeColors(definition.color, "subtle")
            const count = columns.get(code)?.length ?? 0

            return (

              <div
                key={code}
                className="w-full shrink-0 snap-center"
              >

                <div className="flex h-10 items-center justify-center gap-2 px-12">

                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                    style={{ color: badge.text, backgroundColor: badge.background }}
                  >
                    {code}
                  </span>

                  {Icon && (
                    <Icon
                      size={15}
                      className="shrink-0"
                      style={{ color: definition.color }}
                    />
                  )}

                  <span className="truncate text-sm font-bold uppercase tracking-wide text-neutral-200">
                    {definition.label}
                  </span>

                  <span className="shrink-0 text-xs font-semibold text-neutral-500">
                    {count}
                  </span>

                </div>

                <div className="mt-2">

                  <TaskProcessColumn
                    processCode={code}
                    tasks={columns.get(code) ?? []}
                    allTasks={tasks}
                    expandedKey={expandedKey}
                    onToggleCard={onToggleCard}
                    activeOverlayKey={activeOverlayKey}
                    onOverlayOpenChange={onOverlayOpenChange}
                    contentOnly
                  />

                </div>

              </div>

            )

          })}

        </div>

      </div>

    </div>

  )

}