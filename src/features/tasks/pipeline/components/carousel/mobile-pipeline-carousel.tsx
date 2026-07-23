"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { getBadgeColors } from "@/shared/utils/badge-colors"
import { cn } from "@/shared/utils/utils"

import { useDragScroll } from "@/shared/ui/horizontal-scroll/use-drag-scroll"
import { useHorizontalFade } from "@/shared/hooks/use-horizontal-fade"

import { PIPELINE_PROCESS_ORDER } from "../../utils/process-columns"
import { TaskProcessColumn } from "../../table/task-process-column"
import { TaskColumnOperator } from "../tasks/task-column-operator"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

type Props = {
  tasks: Task[]
  columns: Map<ProcessCode, Task[]>
  expandedKey: string | null
  onToggleCard: (key: string) => void
  activeOverlayKey: string | null
  onOverlayOpenChange: (key: string, isOpen: boolean) => void
}

// Mismo mecanismo que la rama desktop de TaskPipelineBoard: un solo
// contenedor con scroll (useDragScroll) — sin hooks de sync propios,
// sin estado de "proceso activo". Header y contenido se mueven
// juntos porque son la misma superficie de scroll.
//
// El header NO reutiliza TaskProcessColumn(headerOnly) — ese es
// ColumnHeader, con "w-72" HARDCODEADO pensado para columnas
// angostas de desktop. Acá se arma un header propio, centrado y a
// todo el ancho, que sí escala con la pantalla. Incluye lo mismo
// que trae ColumnHeader: el chip del proceso Y la fila de operario
// (TaskColumnOperator) — antes se me había quedado afuera.
//
// Las flechas de navegación también son un calco de las de
// desktop (mismo scrollBy), solo que sin el gate de "hoveringHeader"
// —en touch no hay hover— así que se muestran directo según haya o
// no más para scrollear.
export function MobilePipelineCarousel({
  tasks,
  columns,
  expandedKey,
  onToggleCard,
  activeOverlayKey,
  onOverlayOpenChange,
}: Props) {

  const {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleClickCapture,
    stopDragging,
  } = useDragScroll()

  const { leftFade, rightFade } = useHorizontalFade({ containerRef })

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // El fade solo tiene sentido mientras la tarjeta está realmente
  // en movimiento saliendo/entrando de pantalla — acá cada página
  // ocupa el 100% del contenedor (snap-center de a una), así que en
  // reposo la tarjeta centrada ya se ve completa, sin ningún borde
  // de la siguiente/anterior asomando. Aplicar el mask todo el
  // tiempo solo recorta sus propios bordes sin motivo. Se activa en
  // el primer scroll y se apaga solo tras un breve respiro sin
  // eventos (fin de la inercia/snap).
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleScroll = useCallback(() => {

    setIsScrolling(true)

    if (scrollEndTimeoutRef.current !== null) {
      clearTimeout(scrollEndTimeoutRef.current)
    }

    scrollEndTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
      scrollEndTimeoutRef.current = null
    }, 150)

  }, [])

  useEffect(() => {

    const el = containerRef.current

    if (!el) {
      return
    }

    el.addEventListener("scroll", handleScroll, { passive: true })

    return () => {

      el.removeEventListener("scroll", handleScroll)

      if (scrollEndTimeoutRef.current !== null) {
        clearTimeout(scrollEndTimeoutRef.current)
      }

    }

  }, [handleScroll, containerRef])

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

  function scrollToPrevious() {

    containerRef.current?.scrollBy({
      left: -(containerRef.current?.clientWidth ?? 0),
      behavior: "smooth",
    })

  }

  function scrollToNext() {

    containerRef.current?.scrollBy({
      left: containerRef.current?.clientWidth ?? 0,
      behavior: "smooth",
    })

  }

  return (

    <div className="relative">

      <button
        type="button"
        onClick={scrollToPrevious}
        aria-label="Proceso anterior"
        tabIndex={-1}
        className={cn(
          "absolute left-1 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 text-neutral-200 backdrop-blur-xl transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft size={15} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={scrollToNext}
        aria-label="Proceso siguiente"
        tabIndex={-1}
        className={cn(
          "absolute right-1 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 text-neutral-200 backdrop-blur-xl transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight size={15} strokeWidth={2.5} />
      </button>

      <div
        style={
          isScrolling
            ? {
                WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${leftFade}px, black calc(100% - ${rightFade}px), transparent 100%)`,
                maskImage: `linear-gradient(to right, transparent 0, black ${leftFade}px, black calc(100% - ${rightFade}px), transparent 100%)`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }
            : undefined
        }
        className="overflow-hidden"
      >

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onClickCapture={handleClickCapture}
          className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden select-none"
        >

          {PIPELINE_PROCESS_ORDER.map(code => {

            const definition = PROCESS_DEFINITIONS[code]
            const Icon = ENTITY_ICONS[definition.icon]
            const badge = getBadgeColors(definition.color, "subtle")
            const processTasks = columns.get(code) ?? []
            const count = processTasks.length

            return (

              <div
                key={code}
                className="w-full shrink-0 snap-center"
              >

                {/* Header propio, CENTRADO — igual que el chip
                    del carrusel de KPIs, no left-aligned con el
                    contador empujado a la derecha como en
                    ColumnHeader (desktop). */}
                <div
                  data-drag-scroll-ignore
                  className="flex h-10 items-center justify-center gap-2 border-b px-3"
                  style={{ borderColor: definition.color, cursor: "default" }}
                >

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

                {/* Fila de operario — lo mismo que trae
                    ColumnHeader en desktop, se había quedado
                    afuera del header propio de acá. */}
                <div
                  data-drag-scroll-ignore
                  className="border-b border-white/5 px-2 py-1"
                  style={{ cursor: "default" }}
                >

                  <TaskColumnOperator
                    processCode={code}
                    tasks={processTasks}
                  />

                </div>

                <div
                  data-drag-scroll-ignore
                  className="mt-2"
                  style={{ cursor: "default" }}
                >

                  <TaskProcessColumn
                    processCode={code}
                    tasks={processTasks}
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