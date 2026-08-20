"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both"

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: ScrollAreaOrientation
  /** Mostrar scrollbar nativa (por defecto oculta; el scroll sigue activo). */
  showScrollbar?: boolean
}

/**
 * Contenedor de scroll nativo del browser.
 * Sin física custom, sin drag, sin map de wheel.
 * El eje lo define `orientation` + overflow CSS.
 */
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
  ) => {
    return (
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
    )
  },
)

ScrollArea.displayName = "ScrollArea"
