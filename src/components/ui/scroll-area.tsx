"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both"

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: ScrollAreaOrientation
  showScrollbar?: boolean
}

/** Scroll nativo del browser — solo overflow + touch-action por eje. */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      orientation = "vertical",
      showScrollbar = false,
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn(
        "relative min-h-0 min-w-0",
        orientation === "vertical" &&
          "overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y",
        orientation === "horizontal" &&
          "overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x",
        orientation === "both" &&
          "overflow-auto overscroll-contain touch-pan-x touch-pan-y",
        showScrollbar
          ? "native-scrollbar"
          : "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)

ScrollArea.displayName = "ScrollArea"
