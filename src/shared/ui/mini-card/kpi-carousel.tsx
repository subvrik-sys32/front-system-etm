"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { useDragScroll } from "@/shared/ui/horizontal-scroll/use-drag-scroll"
import { useHorizontalFade } from "@/shared/hooks/use-horizontal-fade"
import { cn } from "@/shared/utils/utils"

// Extraído de TaskPipelineHeader — misma lógica de carrusel de KPIs
// (grilla en desktop, tarjeta única deslizable con flechas en mobile),
// reutilizable por cualquier sección que muestre un set de KPIs
// (pipeline de tareas, panel expandido de proyecto, etc.).
const SCROLL_SETTLE_DELAY = 300

type Props = {
  cards: React.ReactNode[]
}

export function KpiCarousel({ cards }: Props) {

  const { isMobile } = useResponsive()

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
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

  if (!isMobile) {

    return (

      <div className="grid grid-cols-2 gap-4 laptop:grid-cols-4">

        {cards}

      </div>

    )

  }

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