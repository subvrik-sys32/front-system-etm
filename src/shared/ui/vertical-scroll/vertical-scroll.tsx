"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

import { cn } from "@/shared/utils/utils"

const FADE_SIZE = 9

type Props = {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  style?: React.CSSProperties
}

// Arma el mask-image según qué lado tiene contenido real por
// scrollear. Si un lado no puede scrollear más, ahí no hay fade
// (queda sólido), igual que la flecha de ese lado desaparece.
function getMaskImage(canScrollUp: boolean, canScrollDown: boolean) {

  if (canScrollUp && canScrollDown) {
    return `linear-gradient(to bottom, transparent 0, black ${FADE_SIZE}px, black calc(100% - ${FADE_SIZE}px), transparent 100%)`
  }

  if (canScrollUp) {
    return `linear-gradient(to bottom, transparent 0, black ${FADE_SIZE}px, black 100%)`
  }

  if (canScrollDown) {
    return `linear-gradient(to bottom, black 0, black calc(100% - ${FADE_SIZE}px), transparent 100%)`
  }

  return "none"

}

export function VerticalScroll({
  children,
  className,
  containerClassName,
  style,
}: Props) {

  const containerRef = useRef<HTMLDivElement>(null)

  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const updateArrows = useCallback(() => {

    const el = containerRef.current

    if (!el) {
      return
    }

    setCanScrollUp(el.scrollTop > 4)

    setCanScrollDown(
      el.scrollTop + el.clientHeight < el.scrollHeight - 4
    )

  }, [])

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

  }, [updateArrows])

  function scrollUp() {

    containerRef.current?.scrollBy({
      top: -120,
      behavior: "smooth",
    })

  }

  function scrollDown() {

    containerRef.current?.scrollBy({
      top: 120,
      behavior: "smooth",
    })

  }

  const maskImage = useMemo(
    () => getMaskImage(canScrollUp, canScrollDown),
    [canScrollUp, canScrollDown]
  )

  return (

    <div className={cn("relative flex min-h-0 flex-col", containerClassName)}>

      <button
        type="button"
        onClick={scrollUp}
        aria-label="Desplazar arriba"
        tabIndex={-1}
        className={cn(
          "absolute left-1/2 top-1 z-20 -translate-x-1/2",
          "flex h-6 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          canScrollUp ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronUp size={14} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={scrollDown}
        aria-label="Desplazar abajo"
        tabIndex={-1}
        className={cn(
          "absolute bottom-1 left-1/2 z-20 -translate-x-1/2",
          "flex h-6 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          canScrollDown ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronDown size={14} strokeWidth={2.5} />
      </button>

      {/*
        min-h-0 flex-1 hardcoded ACÁ (no depende de que cada
        consumidor lo pase bien en containerClassName/className): el
        wrapper de arriba ahora es "flex flex-col" siempre, así que
        este div —el único hijo real en flujo, ya que los botones son
        absolute— se estira a ocupar exactamente el alto disponible
        del wrapper como flex item, en vez de crecer libre con su
        contenido. Sin esto, overflow-y-auto no tiene un alto acotado
        contra el cual comparar el contenido y nunca detecta que hay
        overflow — el scroll termina escapándose al documento nativo
        en vez de quedar contenido acá adentro.
      */}
      <div
        ref={containerRef}
        style={{
          ...style,
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
        className={cn(
          "hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain",
          className,
        )}
      >

        {children}

      </div>

    </div>

  )

}