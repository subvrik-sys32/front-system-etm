"use client"

import { PropsWithChildren, useMemo } from "react"
import { cn } from "@/shared/utils/utils"
import { useDragScroll } from "@/shared/ui/horizontal-scroll/use-drag-scroll"
import { useHorizontalFade } from "@/shared/hooks/use-horizontal-fade"

type Props = PropsWithChildren<{
  className?: string
  fade?: boolean
  drag?: boolean
}>

export function PipelineScroll({
  children,
  className,
  fade = true,
  drag = true,
}: Props) {

  const { containerRef, handleMouseDown, handleMouseMove, handleClickCapture, stopDragging } = useDragScroll()

  const { leftFade, rightFade } = useHorizontalFade({ containerRef })

  const maskStyle = useMemo(() => {

    if (!fade) {
      return
    }

    return {
      WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${leftFade}px, black calc(100% - ${rightFade}px), transparent 100%)`,
      maskImage: `linear-gradient(to right, transparent 0, black ${leftFade}px, black calc(100% - ${rightFade}px), transparent 100%)`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
    }

  }, [fade, leftFade, rightFade])

  return (

    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden">

      <div
        ref={containerRef}
        style={maskStyle}
        onMouseDown={drag ? handleMouseDown : undefined}
        onMouseMove={drag ? handleMouseMove : undefined}
        onMouseUp={drag ? stopDragging : undefined}
        onMouseLeave={drag ? stopDragging : undefined}
        onClickCapture={handleClickCapture}
        className={cn("hide-scrollbar h-full min-h-0 overflow-x-auto overflow-y-hidden overscroll-contain", drag && ["cursor-grab", "active:cursor-grabbing", "select-none"])}
      >

        <div className={cn("flex h-full w-max items-start gap-4", className)}>
          {children}
        </div>

      </div>

    </div>

  )

}