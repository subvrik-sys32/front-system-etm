"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { Task } from "@/features/tasks/types/task.types"
import type { ProcessCode } from "@/features/tasks/types/task.types"

import { useDragScroll } from "@/shared/ui/horizontal-scroll/use-drag-scroll"
import { useHorizontalFade } from "@/shared/hooks/use-horizontal-fade"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { PIPELINE_PROCESS_ORDER } from "../utils/process-columns"
import { getTaskProcesses } from "../utils/get-task-process"

import { TaskProcessColumn } from "../table/task-process-column"
import { TaskPipelineHeader } from "../table/task-pipeline-header"
import { TaskPipelineSkeleton } from "../components/task-pipeline-skeleton"
import { PipelineProcessSelector } from "./pipeline-process-selector"
import { TaskPipelineCarousel } from "./task-pipeline-carousel"

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

  const { isMobile } = useResponsive()

  const [expandedKey, setExpandedKey] =
    useState<string | null>(null)

  const [activeOverlayKey, setActiveOverlayKey] =
    useState<string | null>(null)

  const [pendingAutoExpandKey, setPendingAutoExpandKey] =
    useState<string | null>(null)

  const [openTaskDialog, setOpenTaskDialog] =
    useState(false)

  const [hoveringHeader, setHoveringHeader] =
    useState(false)

  const [canScrollLeft, setCanScrollLeft] =
    useState(false)

  const [canScrollRight, setCanScrollRight] =
    useState(false)

  // Solo relevante en mobile: qué proceso se está viendo
  // en la columna única.
  const [activeProcess, setActiveProcess] =
    useState<ProcessCode>(PIPELINE_PROCESS_ORDER[0])

  // Refs a los nodos scrolleables del selector de arriba y del
  // carrusel de tareas de abajo — necesarios para espejar su
  // posición de scroll en TIEMPO REAL (ver efecto más abajo).
  const selectorScrollRef = useRef<HTMLDivElement>(null)
  const contentScrollRef = useRef<HTMLDivElement>(null)

  // useSnapCarouselSync ya sincroniza el ESTADO (activeProcess) entre
  // ambos, pero eso pasa por un debounce (~120ms) + el ida-y-vuelta
  // de React — visualmente se sentía como "muevo el selector, y
  // recién después de un momento las cards reaccionan". Acá los
  // espejamos en tiempo real, en CADA evento de scroll de cualquiera
  // de los dos, así se mueven exactamente juntos, frame a frame,
  // sin esperar a que nada se asiente ni pasar por React. El estado
  // (activeProcess) sigue actualizándose por su cuenta al final,
  // vía el debounce existente — esto solo resuelve el MOVIMIENTO.
  useEffect(() => {

    if (!isMobile) {
      return
    }

    const selectorEl = selectorScrollRef.current
    const contentEl = contentScrollRef.current

    if (!selectorEl || !contentEl) {
      return
    }

    let syncing = false

    const mirror = (from: HTMLDivElement, to: HTMLDivElement) => {

      if (syncing) {
        return
      }

      syncing = true

      const fromMax = Math.max(from.scrollWidth - from.clientWidth, 1)
      const ratio = from.scrollLeft / fromMax

      const toMax = Math.max(to.scrollWidth - to.clientWidth, 1)

      to.scrollLeft = ratio * toMax

      // Deja pasar un frame antes de volver a permitir espejar —
      // evita que el scroll que acabamos de asignar (que también
      // dispara su propio evento "scroll") rebote de vuelta al
      // origen en un ping-pong infinito.
      requestAnimationFrame(() => {
        syncing = false
      })

    }

    const handleSelectorScroll = () => mirror(selectorEl, contentEl)
    const handleContentScroll = () => mirror(contentEl, selectorEl)

    selectorEl.addEventListener("scroll", handleSelectorScroll, { passive: true })
    contentEl.addEventListener("scroll", handleContentScroll, { passive: true })

    return () => {

      selectorEl.removeEventListener("scroll", handleSelectorScroll)
      contentEl.removeEventListener("scroll", handleContentScroll)

    }

  }, [isMobile])

  const {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleClickCapture,
    stopDragging,
  } = useDragScroll()

  const { leftFade, rightFade } =
    useHorizontalFade({ containerRef })

  const prevTasksRef = useRef<Task[]>([])

  useEffect(() => {

    const prev = prevTasksRef.current

    if (prev.length === 0) {

      prevTasksRef.current = tasks

      return

    }

    let detectedKey: string | null = null

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

        if (prevStep && prevStep.status !== "PENDING") {

          detectedKey = `${task.id}:${step.processCode}`

          break

        }

      }

      if (detectedKey) {
        break
      }

    }

    if (detectedKey) {

      if (activeOverlayKey !== null) {

        setPendingAutoExpandKey(detectedKey)

      } else {

        setExpandedKey(detectedKey)

      }

    }

    prevTasksRef.current = tasks

  }, [tasks, activeOverlayKey])

  useEffect(() => {

    if (activeOverlayKey === null && pendingAutoExpandKey !== null) {

      setExpandedKey(pendingAutoExpandKey)
      setPendingAutoExpandKey(null)

    }

  }, [activeOverlayKey, pendingAutoExpandKey])

  const handleOverlayOpenChange = useCallback(
    (key: string, isOpen: boolean) => {
      setActiveOverlayKey(isOpen ? key : null)
    },
    [],
  )

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

    // En mobile no existe el contenedor de drag-scroll horizontal,
    // así que este listener no tiene nada que observar.
    if (isMobile) {
      return
    }

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

  }, [updateArrows, containerRef, isMobile])

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

    if (activeOverlayKey !== null) {
      return
    }

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

  // ---------- Rama mobile: selector + carrusel de columnas ----------
  if (isMobile) {

    return (

      // Sin h-full/overflow-hidden: el contenido (KPI + selector +
      // lista completa de cards) fluye con su alto real, y el
      // <main> del AppShell lo scrollea como página normal.
      // pb-28: reserva espacio abajo para que la última tarjeta no
      // quede tapada por el FAB de "Nueva tarea" (fixed, bottom-20 +
      // tamaño del botón) cuando se scrollea hasta el final.
      <div className="flex flex-col pb-28">

        <TaskPipelineHeader tasks={kpiTasks} />

        {/* sticky: queda visible mientras se scrollea la lista de
            abajo, sin necesitar su propio contenedor de scroll. */}
        <div className="sticky top-0 z-10 bg-[#050505]">

          <PipelineProcessSelector
            value={activeProcess}
            onChange={setActiveProcess}
            columns={columns}
            containerRef={selectorScrollRef}
          />

        </div>

        <div className="mt-2">

          <TaskPipelineCarousel
            value={activeProcess}
            onChange={setActiveProcess}
            tasks={tasks}
            columns={columns}
            expandedKey={expandedKey}
            onToggleCard={toggleCard}
            activeOverlayKey={activeOverlayKey}
            onOverlayOpenChange={handleOverlayOpenChange}
<<<<<<< HEAD
=======
            containerRef={contentScrollRef}
>>>>>>> 42351cd540a77db0a78df520832f0caa134a908e
          />

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

  // ---------- Rama desktop: sin cambios ----------
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
                    activeOverlayKey={activeOverlayKey}
                    onOverlayOpenChange={handleOverlayOpenChange}
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
                    allTasks={tasks}
                    expandedKey={expandedKey}
                    onToggleCard={toggleCard}
                    activeOverlayKey={activeOverlayKey}
                    onOverlayOpenChange={handleOverlayOpenChange}
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