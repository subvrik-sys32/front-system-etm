"use client"
import {
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

const FADE_SIZE = 36

type Props = {
  containerRef: RefObject<HTMLDivElement | null>
}

type FadeState = {
  leftFade: number
  rightFade: number
}

export function useHorizontalFade({
  containerRef,
}: Props) {
  const [fade, setFade] = useState<FadeState>({
    leftFade: 0,
    rightFade: 0,
  })
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const updateFade = () => {
      const { scrollLeft, clientWidth, scrollWidth } = container
      const maxScroll = Math.max(scrollWidth - clientWidth, 0)

      if (maxScroll <= 0) {
        setFade((prev) =>
          prev.leftFade === 0 && prev.rightFade === 0
            ? prev
            : { leftFade: 0, rightFade: 0 },
        )
        return
      }

      const leftFade = Math.min(scrollLeft, FADE_SIZE)
      const rightFade = Math.min(maxScroll - scrollLeft, FADE_SIZE)

      setFade((prev) =>
        prev.leftFade === leftFade && prev.rightFade === rightFade
          ? prev
          : { leftFade, rightFade },
      )
    }

    // Throttle con rAF: evita un setState por cada evento nativo de scroll
    const scheduleUpdate = () => {
      if (rafRef.current !== null) {
        return
      }
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        updateFade()
      })
    }

    updateFade()

    container.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    })

    // Observa tanto el contenedor (cambios de clientWidth)
    // como el contenido interno (cambios de scrollWidth,
    // p. ej. al agregar/quitar hijos sin resize externo)
    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(container)

    const content = container.firstElementChild
    if (content) {
      resizeObserver.observe(content)
    }

    return () => {
      container.removeEventListener("scroll", scheduleUpdate)
      resizeObserver.disconnect()
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [containerRef])

  return fade
}