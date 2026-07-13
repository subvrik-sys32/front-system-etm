"use client"

import {
  RefObject,
  useLayoutEffect,
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

  useLayoutEffect(() => {

    const container = containerRef.current

    if (!container) {
      return
    }

    const updateFade = () => {

      const {
        scrollLeft,
        clientWidth,
        scrollWidth,
      } = container

      const maxScroll = Math.max(
        scrollWidth - clientWidth,
        0,
      )

      if (maxScroll <= 0) {

        setFade({
          leftFade: 0,
          rightFade: 0,
        })

        return

      }

      setFade({

        leftFade: Math.min(
          scrollLeft,
          FADE_SIZE,
        ),

        rightFade: Math.min(
          maxScroll - scrollLeft,
          FADE_SIZE,
        ),

      })

    }

    updateFade()

    container.addEventListener(
      "scroll",
      updateFade,
      {
        passive: true,
      },
    )

    const resizeObserver =
      new ResizeObserver(
        updateFade,
      )

    resizeObserver.observe(
      container,
    )

    return () => {

      container.removeEventListener(
        "scroll",
        updateFade,
      )

      resizeObserver.disconnect()

    }

  }, [
    containerRef,
  ])

  return fade

}