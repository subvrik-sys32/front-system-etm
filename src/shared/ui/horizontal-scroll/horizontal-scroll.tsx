"use client"

import {
  PropsWithChildren,
  useMemo,
} from "react"

import {
  cn,
} from "@/shared/utils/utils"

import {
  useDragScroll,
} from "./use-drag-scroll"

import {
  useHorizontalFade,
} from "../../hooks/use-horizontal-fade"

type Props =
  PropsWithChildren<{
    className?: string
    fade?: boolean
  }>

export function HorizontalScroll({
  children,
  className,
  fade = true,
}: Props) {

  const {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleClickCapture,
    stopDragging,
  } = useDragScroll()

  const {
    leftFade,
    rightFade,
  } = useHorizontalFade({
    containerRef,
  })

  const maskStyle = useMemo(() => {

    if (!fade) {
      return undefined
    }

    return {

      WebkitMaskImage: `
        linear-gradient(
          to right,
          transparent 0,
          black ${leftFade}px,
          black calc(100% - ${rightFade}px),
          transparent 100%
        )
      `,

      maskImage: `
        linear-gradient(
          to right,
          transparent 0,
          black ${leftFade}px,
          black calc(100% - ${rightFade}px),
          transparent 100%
        )
      `,

      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",

      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",

    }

  }, [
    fade,
    leftFade,
    rightFade,
  ])

  return (

    <div className="relative overflow-hidden">

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onClickCapture={handleClickCapture}
        style={maskStyle}
        className="hide-scrollbar overflow-x-auto overflow-y-hidden overscroll-x-contain cursor-grab select-none scrollbar-none active:cursor-grabbing"
      >

        <div
          className={cn(
            "flex w-max gap-4",
            className,
          )}
        >

          {children}

        </div>

      </div>

    </div>

  )

}