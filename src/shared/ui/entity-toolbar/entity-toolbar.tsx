"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"

type Props = {
  left?: ReactNode
  right?: ReactNode
  className?: string
  /** chrome = compacto dentro de DesktopTopBar */
  variant?: "page" | "chrome"
}

/**
 * Toolbar de entidad.
 *
 * Sombras de chips: un ancestro con overflow-x auto/hidden recorta
 * box-shadow (en CSS overflow-x ≠ visible fuerza overflow-y ≠ visible).
 * Por eso acá y en FilterBar chips → overflow-visible + flex-wrap;
 * el padding solo ayuda si el clip ya no existe en el padre directo.
 */
export function EntityToolbar({
  left,
  right,
  className,
  variant = "page",
}: Props) {
  const isChrome = variant === "chrome"

  return (
    <div
      className={cn(
        "relative z-30 flex min-w-0 items-center gap-x-2 gap-y-1.5",
        isChrome
          ? "w-auto shrink flex-nowrap items-center justify-end overflow-visible py-0 px-0 gap-1.5"
          : "w-full shrink-0 flex-wrap justify-between min-h-0 px-1 py-1 overflow-visible laptop:min-h-14 laptop:py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1.5 overflow-visible">
        {left}
      </div>
      {right != null && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 overflow-visible">
          {right}
        </div>
      )}
    </div>
  )
}

export function EntityToolbarChrome({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        max-md:sticky max-md:top-14 max-md:z-10
        max-md:bg-background/80 max-md:backdrop-blur-xl
        max-md:supports-backdrop-filter:bg-background/55
        overflow-visible
      "
    >
      {children}
    </div>
  )
}
