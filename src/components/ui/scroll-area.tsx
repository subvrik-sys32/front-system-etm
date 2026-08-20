"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both"

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: ScrollAreaOrientation
  /** Show native scrollbar (default: hidden, still scrollable). */
  showScrollbar?: boolean
  /**
   * Only for orientation="horizontal": map vertical mouse-wheel to horizontal
   * scroll. Trackpads already send deltaX natively.
   */
  mapVerticalWheel?: boolean
}

/**
 * Native overflow scroll container.
 * No custom drag physics — browser touch/wheel/trackpad only.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      orientation = "vertical",
      showScrollbar = false,
      mapVerticalWheel = false,
      children,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLDivElement | null>(null)

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        internalRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [ref],
    )

    React.useEffect(() => {
      const el = internalRef.current
      if (!el || orientation === "vertical" || !mapVerticalWheel) return

      const onWheel = (event: WheelEvent) => {
        if (el.scrollWidth <= el.clientWidth + 1) return
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return
        if (event.deltaY === 0) return
        el.scrollLeft += event.deltaY
        event.preventDefault()
      }

      el.addEventListener("wheel", onWheel, { passive: false })
      return () => el.removeEventListener("wheel", onWheel)
    }, [orientation, mapVerticalWheel])

    return (
      <div
        ref={setRefs}
        data-slot="scroll-area"
        className={cn(
          "relative min-h-0 min-w-0",
          orientation === "vertical" &&
            "overflow-y-auto overflow-x-hidden overscroll-y-contain",
          orientation === "horizontal" &&
            "overflow-x-auto overflow-y-hidden overscroll-x-contain",
          orientation === "both" && "overflow-auto overscroll-contain",
          showScrollbar
            ? "native-scrollbar"
            : "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
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
