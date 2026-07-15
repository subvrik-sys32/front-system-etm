"use client"

import {
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

const FADE_MIN = 24
const FADE_MAX = 80

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

      // Fade proporcional al ancho del contenedor:
      // 8% del ancho visible, entre FADE_MIN y FADE_MAX.
      const fadeSize = Math.min(
        Math.max(Math.round(clientWidth * 0.08), FADE_MIN),
        FADE_MAX,
      )

      const leftFade = Math.min(scrollLeft, fadeSize)
      const rightFade = Math.min(maxScroll - scrollLeft, fadeSize)

      setFade((prev) =>
        prev.leftFade === leftFade && prev.rightFade === rightFade
          ? prev
          : { leftFade, rightFade },
      )

    }

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