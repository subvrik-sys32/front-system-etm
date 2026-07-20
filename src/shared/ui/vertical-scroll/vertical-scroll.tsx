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
  // En px. Antes las flechas estaban siempre a 4px del borde
  // (top-1/bottom-1) — bien para el caso normal, pero si este
  // VerticalScroll vive debajo de barras flotantes ABSOLUTE que no
  // forman parte de su propio layout (como el TopBar/BottomNav
  // mobile), las flechas quedaban tapadas por esas barras. Estos
  // props dejan que quien lo usa le diga cuánto espacio real hay
  // que dejar antes de dibujarlas.
  arrowTopOffset?: number
  arrowBottomOffset?: number
  // "center" (default): flechas centradas horizontalmente — bien para
  // contenido que ocupa todo el ancho (listas, popovers). "right": las
  // pega al borde derecho — pensado para columnas angostas como el
  // sidebar, donde centrarlas queda raro sobre texto alineado a la
  // izquierda.
  arrowAlign?: "center" | "right"
  // Clases extra para el botón de flecha (fondo, blur, opacidad
  // base). Se agregan DESPUÉS de las clases default, así que pueden
  // pisarlas — pensado para casos como el sidebar, donde el fondo
  // default (bg-[#18181b]/80) se ve muy sólido sobre un panel que ya
  // es oscuro de por sí.
  arrowClassName?: string
}

const ARROW_ALIGN_CLASSNAME: Record<"center" | "right", string> = {
  center: "left-1/2 -translate-x-1/2",
  right: "right-2",
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
  arrowTopOffset = 4,
  arrowBottomOffset = 4,
  arrowAlign = "center",
  arrowClassName,
}: Props) {

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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
    const contentEl = contentRef.current

    if (!el || !contentEl) {
      return
    }

    updateArrows()

    el.addEventListener("scroll", updateArrows, { passive: true })

    // Observamos DOS cosas, no solo el contenedor: ahora que tiene
    // alto acotado (flex-1 min-h-0), su propio tamaño ya no cambia
    // cuando el contenido crece (ej. cuando termina de cargar la
    // data real, o se expande una tarjeta) — así que un
    // ResizeObserver solo sobre el contenedor no se entera de nada
    // en esos casos. Observamos también el wrapper del contenido
    // (contentRef), que sí cambia de tamaño cuando eso pasa, para
    // recalcular las flechas apenas hay más para scrollear, sin
    // esperar a que el usuario mueva el dedo primero.
    const observer = new ResizeObserver(updateArrows)

    observer.observe(el)
    observer.observe(contentEl)

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
        style={{ top: arrowTopOffset }}
        className={cn(
          "absolute z-20",
          ARROW_ALIGN_CLASSNAME[arrowAlign],
          "flex h-6 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          canScrollUp ? "opacity-100" : "pointer-events-none opacity-0",
          arrowClassName,
        )}
      >
        <ChevronUp size={14} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        onClick={scrollDown}
        aria-label="Desplazar abajo"
        tabIndex={-1}
        style={{ bottom: arrowBottomOffset }}
        className={cn(
          "absolute z-20",
          ARROW_ALIGN_CLASSNAME[arrowAlign],
          "flex h-6 w-8 items-center justify-center rounded-full",
          "bg-[#18181b]/80 backdrop-blur-xl text-neutral-200 transition-opacity duration-200",
          canScrollDown ? "opacity-100" : "pointer-events-none opacity-0",
          arrowClassName,
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

        <div ref={contentRef}>

          {children}

        </div>

      </div>

    </div>

  )

}