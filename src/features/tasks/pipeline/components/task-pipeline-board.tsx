"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { Task } from "@/features/tasks/types/task.types"

import { useDragScroll } from "@/shared/ui/horizontal-scroll/use-drag-scroll"
import { useHorizontalFade } from "@/shared/hooks/use-horizontal-fade"

import { PIPELINE_PROCESS_ORDER } from "../utils/process-columns"
import { getTaskProcesses } from "../utils/get-task-process"

import { TaskProcessColumn } from "../table/task-process-column"
import { TaskPipelineHeader } from "../table/task-pipeline-header"
import { TaskPipelineSkeleton } from "../components/task-pipeline-skeleton"

import { TaskDialog } from "@/features/tasks/components/dialog/task-dialog"

const SCROLL_STEP = 320

type Props = {
  tasks: Task[]
  kpiTasks: Task[]
  loading?: boolean
}

export function TaskPipelineBoard({
  tasks,
  kpiTasks,
  loading = false,
}: Props) {

  const [expandedKey, setExpandedKey] =
    useState<string | null>(null)

  const [openTaskDialog, setOpenTaskDialog] =
    useState(false)

  const [hoveringHeader, setHoveringHeader] =
    useState(false)

  const [canScrollLeft, setCanScrollLeft] =
    useState(false)

  const [canScrollRight, setCanScrollRight] =
    useState(false)

  const {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleClickCapture,
    stopDragging,
  } = useDragScroll()

  const { leftFade, rightFade } =
    useHorizontalFade({ containerRef })

  // Snapshot del estado anterior de tasks para detectar
  // qué step pasó de no-PENDING a PENDING (señal de Revisar).
  const prevTasksRef = useRef<Task[]>([])

  useEffect(() => {

    const prev = prevTasksRef.current

    if (prev.length === 0) {

      prevTasksRef.current = tasks

      return

    }

    for (const task of tasks) {

      const prevTask = prev.find(t => t.id === task.id)

      if (!prevTask) {
        continue
      }

      for (const step of task.workflowSteps) {

        if (step.status !== "PENDING") {
          continue
        }

        const prevStep = prevTask.workflowSteps.find(
          s => s.id === step.id,
        )

        // Este step pasó de otro estado a PENDING —
        // es el nuevo proceso activo después de un Revisar.
        if (prevStep && prevStep.status !== "PENDING") {

          setExpandedKey(`${task.id}:${step.processCode}`)

          break

        }

      }

    }

    prevTasksRef.current = tasks

  }, [tasks])

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

  function toggleCard(key: string) {

    setExpandedKey(current =>
      current === key ? null : key,
    )

  }

  const columns = useMemo(() => {

    const grouped = new Map(
      PIPELINE_PROCESS_ORDER.map(code => [code, [] as Task[]]),
    )

    for (const task of tasks) {

      const processes = getTaskProcesses(task)

      for (const process of processes) {
        grouped.get(process)?.push(task)
      }

    }

    return grouped

  }, [tasks])

  if (loading) {
    return <TaskPipelineSkeleton />
  }

  const showLeft = hoveringHeader && canScrollLeft
  const showRight = hoveringHeader && canScrollRight

  return (

    <div className="flex h-full min-h-0 flex-col overflow-hidden">

      <TaskPipelineHeader tasks={kpiTasks} />

      <div
        className="relative mt-4 min-h-0 flex-1 overflow-hidden"
        onMouseEnter={() => setHoveringHeader(true)}
        onMouseLeave={() => setHoveringHeader(false)}
      >

        <button
          type="button"
          onClick={scrollLeft}
          aria-label="Scrollear izquierda"
          tabIndex={-1}
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
          className={`
            absolute left-2 top-5.5 z-20 -translate-y-1/2
            flex h-7 w-8 items-center justify-center
            rounded-lg bg-[#18181b]/60 backdrop-blur-xl
            text-neutral-200 transition-opacity duration-200
            hover:bg-[#18181b]
            ${showLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
        >
          <ChevronLeft size={13} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={scrollRight}
          aria-label="Scrollear derecha"
          tabIndex={-1}
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
          className={`
            absolute right-2 top-5.5 z-20 -translate-y-1/2
            flex h-7 w-8 items-center justify-center
            rounded-lg bg-[#18181b]/60 backdrop-blur-xl
            text-neutral-200 transition-opacity duration-200
            hover:bg-[#18181b]
            ${showRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
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
            className="hide-scrollbar h-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none"
          >

            <div className="flex h-full w-max flex-col">

              <div className="flex w-max shrink-0 gap-4">

                {PIPELINE_PROCESS_ORDER.map(code => (

                  <TaskProcessColumn
                    key={code}
                    processCode={code}
                    tasks={columns.get(code) ?? []}
                    expandedKey={expandedKey}
                    onToggleCard={toggleCard}
                    headerOnly
                  />

                ))}

              </div>

              <div
                data-drag-scroll-ignore
                className="flex min-h-0 flex-1 w-max gap-4"
                style={{ cursor: "default" }}
              >

                {PIPELINE_PROCESS_ORDER.map(code => (

                  <TaskProcessColumn
                    key={code}
                    processCode={code}
                    tasks={columns.get(code) ?? []}
                    expandedKey={expandedKey}
                    onToggleCard={toggleCard}
                    contentOnly
                  />

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

      {openTaskDialog && (

        <TaskDialog
          open
          promptOpenAfterCreate
          onClose={() => setOpenTaskDialog(false)}
        />

      )}

    </div>

  )

}