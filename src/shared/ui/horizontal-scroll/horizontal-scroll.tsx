"use client"

import {
  PropsWithChildren,
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

type Props=
  PropsWithChildren<{
    className?:string
  }>

export function HorizontalScroll({
  children,
  className,
}:Props){

  const {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleClickCapture,
    stopDragging,
  }=useDragScroll()

  const {
    leftOpacity,
    rightOpacity,
  }=useHorizontalFade({
    containerRef,
  })

  return(

    <div className="relative overflow-hidden">

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onClickCapture={handleClickCapture}
        className="hide-scrollbar overflow-x-auto overflow-y-hidden overscroll-x-contain cursor-grab select-none scrollbar-none active:cursor-grabbing"
      >

        <div
          className={cn(
            "flex w-max gap-4",
            className
          )}
        >

          {children}

        </div>

      </div>

      <div
        style={{
          opacity:leftOpacity,
          transform:
            leftOpacity
              ? "translateX(0)"
              : "translateX(-10px)",
        }}
        className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-linear-to-r from-[#0D0D10] via-[#0D0D10]/90 to-transparent transition-all duration-500 ease-out"
      />

      <div
        style={{
          opacity:rightOpacity,
          transform:
            rightOpacity
              ? "translateX(0)"
              : "translateX(10px)",
        }}
        className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-linear-to-l from-[#0D0D10] via-[#0D0D10]/90 to-transparent transition-all duration-500 ease-out"
      />

    </div>

  )

}