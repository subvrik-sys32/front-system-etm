"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both"

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: ScrollAreaOrientation
  showScrollbar?: boolean
  dragToScroll?: boolean
  mapVerticalWheel?: boolean
  dragThreshold?: number
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  scrollLeft: number
  scrollTop: number
  isDragging: boolean
}

function rafThrottle<T extends (...args: any[]) => void>(fn: T) {
  let rafId: number | null = null

  return function throttled(...args: Parameters<T>) {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      fn(...args)
      rafId = null
    })
  }
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      orientation = "vertical",
      showScrollbar = false,
      dragToScroll = false,
      mapVerticalWheel = false,
      dragThreshold = 5,
      onPointerDown,
      onClickCapture,
      children,
      ...props
    },
    forwardedRef,
  ) => {
    const internalRef = React.useRef<HTMLDivElement | null>(null)

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        internalRef.current = node
        if (typeof forwardedRef === "function") {
          forwardedRef(node)
        } else if (forwardedRef) {
          ;(forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [forwardedRef],
    )

    const dragState = React.useRef<DragState | null>(null)
    const wasJustDragging = React.useRef(false)

    React.useEffect(() => {
      const el = internalRef.current
      if (!el || orientation !== "horizontal") return

      const handleWheel = (event: WheelEvent) => {
        if (el.scrollWidth <= el.clientWidth + 1) return

        const absX = Math.abs(event.deltaX)
        const absY = Math.abs(event.deltaY)

        const isHorizontalIntent =
          absX > absY ||
          (event.shiftKey && absY > 0) ||
          (mapVerticalWheel && absY > 0)

        if (!isHorizontalIntent) return

        const delta = absX > absY ? event.deltaX : event.deltaY
        if (Math.abs(delta) < 0.1) return

        const maxScroll = el.scrollWidth - el.clientWidth
        const canScrollLeft = el.scrollLeft > 0 && delta < 0
        const canScrollRight = el.scrollLeft < maxScroll && delta > 0

        if (canScrollLeft || canScrollRight) {
          el.scrollBy({ left: delta, behavior: "auto" })
          event.preventDefault()
        }
      }

      el.addEventListener("wheel", handleWheel, { passive: false })
      return () => el.removeEventListener("wheel", handleWheel)
    }, [orientation, mapVerticalWheel])

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event)
      if (!dragToScroll || event.button !== 0) return

      const target = event.target as HTMLElement
      const isInteractive = target.closest(
        "button, a, input, textarea, select, option, [role='button'], [role='menuitem'], [role='tab'], [data-drag-ignore]",
      )
      if (isInteractive) return

      const el = internalRef.current
      if (!el) return

      dragState.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
        isDragging: false,
      }

      wasJustDragging.current = false
    }

    const updateScrollPosition = React.useMemo(
      () =>
        rafThrottle((clientX: number, clientY: number) => {
          const state = dragState.current
          const el = internalRef.current
          if (!state || !el) return

          const dx = clientX - state.startX
          const dy = clientY - state.startY

          if (orientation === "horizontal" || orientation === "both") {
            el.scrollLeft = state.scrollLeft - dx
          }
          if (orientation === "vertical" || orientation === "both") {
            el.scrollTop = state.scrollTop - dy
          }
        }),
      [orientation],
    )

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      const state = dragState.current
      if (!state || event.pointerId !== state.pointerId) return

      const dx = event.clientX - state.startX
      const dy = event.clientY - state.startY

      if (!state.isDragging) {
        if (Math.hypot(dx, dy) >= dragThreshold) {
          state.isDragging = true
          wasJustDragging.current = true

          const el = internalRef.current
          if (el && !el.hasPointerCapture(event.pointerId)) {
            try {
              el.setPointerCapture(event.pointerId)
            } catch {}
          }
        } else {
          return
        }
      }

      updateScrollPosition(event.clientX, event.clientY)
    }

    const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
      const state = dragState.current
      const el = internalRef.current

      if (!state || event.pointerId !== state.pointerId) return

      if (el && el.hasPointerCapture(event.pointerId)) {
        try {
          el.releasePointerCapture(event.pointerId)
        } catch {}
      }

      dragState.current = null
    }

    const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
      if (wasJustDragging.current) {
        event.preventDefault()
        event.stopPropagation()
        wasJustDragging.current = false
      }
      onClickCapture?.(event)
    }

    React.useEffect(() => {
      const handleBlur = () => {
        dragState.current = null
        wasJustDragging.current = false
      }
      window.addEventListener("blur", handleBlur)
      return () => window.removeEventListener("blur", handleBlur)
    }, [])

    return (
      <div
        ref={setRefs}
        data-slot="scroll-area"
        onPointerDown={handlePointerDown}
        onPointerMove={dragToScroll ? handlePointerMove : undefined}
        onPointerUp={dragToScroll ? stopDragging : undefined}
        onPointerCancel={dragToScroll ? stopDragging : undefined}
        onClickCapture={handleClickCapture}
        className={cn(
          "relative min-h-0 min-w-0 [transform:translateZ(0)]",
          orientation === "vertical" &&
            "overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y",
          orientation === "horizontal" &&
            "overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x",
          orientation === "both" &&
            "overflow-auto overscroll-contain touch-pan-x touch-pan-y",
          dragToScroll && "cursor-grab active:cursor-grabbing select-none",
          showScrollbar
            ? "native-scrollbar"
            : "scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

ScrollArea.displayName = "ScrollArea"