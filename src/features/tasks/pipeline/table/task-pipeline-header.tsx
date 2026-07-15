"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Puzzle,
} from "lucide-react"

import type { Task } from "@/features/tasks/types/task.types"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { useDragScroll } from "@/shared/ui/horizontal-scroll/use-drag-scroll"
import { useHorizontalFade } from "@/shared/hooks/use-horizontal-fade"
import { cn } from "@/shared/utils/utils"

import { getPipelineKpis } from "../utils/get-pipeline-kpis"
import { PIPELINE_KPI_COLORS } from "../utils/process-columns"

// Tiempo sin eventos de scroll antes de considerar el carrusel
// "detenido" y ocultar las flechas otra vez.
const SCROLL_SETTLE_DELAY = 300

type Props = {
  tasks: Task[]
}

export function TaskPipelineHeader({
  tasks,
}: Props) {

  const kpis = getPipelineKpis(tasks)
  const { isMobile } = useResponsive()

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // true SOLO mientras hay movimiento activo del carrusel (scroll
  // en curso, sea por drag de mouse o swipe táctil nativo). Las
  // flechas se muestran únicamente en esta ventana — en reposo
  // quedan ocultas para no tapar los valores de la card mientras
  // el usuario la está leyendo.
  const [isScrolling, setIsScrolling] = useState(false)
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    if (!isMobile) {
      return
    }

    const el = containerRef.current

    if (!el) {
      return
    }

    updateArrows()

    function handleScroll() {

      updateArrows()

      setIsScrolling(true)

      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current)
      }

      settleTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, SCROLL_SETTLE_DELAY)

    }

    el.addEventListener("scroll", handleScroll, { passive: true })

    const observer = new ResizeObserver(updateArrows)

    observer.observe(el)

    return () => {

      el.removeEventListener("scroll", handleScroll)
      observer.disconnect()

      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current)
      }

    }

  }, [updateArrows, containerRef, isMobile])

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

  const cards = [
    <ProcessMiniCard
      key="tasks"
      size={isMobile ? "large" : "default"}
      label="Tareas"
      icon={ClipboardList}
      color={PIPELINE_KPI_COLORS.tasks}
      rows={[
        { label: "Total", value: kpis.totalTasks },
        { label: "En proceso", value: kpis.inProgressCount },
      ]}
    />,
    <ProcessMiniCard
      key="pieces"
      size={isMobile ? "large" : "default"}
      label="Piezas"
      icon={Puzzle}
      color={PIPELINE_KPI_COLORS.pieces}
      rows={[
        { label: "Total", value: kpis.totalPieces },
        {
          label: "Promedio",
          value: kpis.totalTasks > 0
            ? Math.round(kpis.totalPieces / kpis.totalTasks)
            : 0,
        },
      ]}
    />,
    <ProcessMiniCard
      key="urgent"
      size={isMobile ? "large" : "default"}
      label="Urgentes"
      icon={AlertTriangle}
      color={PIPELINE_KPI_COLORS.urgent}
      rows={[
        { label: "Total", value: kpis.urgentCount },
        {
          label: "Porcentaje",
          value: kpis.totalTasks > 0
            ? `${Math.round((kpis.urgentCount / kpis.totalTasks) * 100)}%`
            : "0%",
        },
      ]}
    />,
    <ProcessMiniCard
      key="progress"
      size={isMobile ? "large" : "default"}
      label="Avance"
      icon={CheckCircle2}
      color={PIPELINE_KPI_COLORS.progress}
      rows={[
        { label: "Finalizadas", value: kpis.completedCount },
        { label: "Progreso", value: `${kpis.progressPercent}%` },
      ]}
    />,
  ]

  if (!isMobile) {

    return (

      <div className="grid grid-cols-2 gap-4 laptop:grid-cols-4">

        {cards}

      </div>

    )

  }

  // Flechas visibles SOLO mientras hay movimiento activo del
  // carrusel Y hay contenido real hacia ese lado. En reposo quedan
  // ocultas (opacity-0 + pointer-events-none), así nunca tapan los
  // valores de la card cuando el usuario simplemente la está leyendo.
  const showLeftArrow = isScrolling && canScrollLeft
  const showRightArrow = isScrolling && canScrollRight

  return (

    <div className="relative h-44 w-full">

      <button
        type="button"
        onClick={scrollLeft}
        aria-label="Anterior"
        tabIndex={-1}
        className={cn(
          "absolute left-1 top-1/2 z-20 -translate-y-1/2",
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          showLeftArrow ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft size={15} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={scrollRight}
        aria-label="Siguiente"
        tabIndex={-1}
        className={cn(
          "absolute right-1 top-1/2 z-20 -translate-y-1/2",
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          showRightArrow ? "opacity-100" : "pointer-events-none opacity-0",
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
          className="hide-scrollbar flex h-full snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-contain scroll-smooth px-1 cursor-grab select-none active:cursor-grabbing"
        >

          {cards.map((card, index) => (

            <div
              key={index}
              className="w-full shrink-0 snap-center"
            >

              {card}

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}