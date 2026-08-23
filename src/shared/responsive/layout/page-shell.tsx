"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"
import { useChromeInset } from "@/shared/responsive/layout/use-chrome-inset"
import { usePathname } from "next/navigation"
import { isImmersiveRoute } from "../navigation/immersive-routes"

type Props = {
  children: ReactNode
  className?: string
  /**
   * fill  = Nesting/Bitácora desktop: inset top+bottom del chrome.
   * list  = listas: inset lo aplica AppListScroll.
   * bleed = CAD: sin paddingTop — el contenido pasa bajo el blur del topbar.
   */
  mode?: "fill" | "list" | "bleed"
}

/**
 * Shell de página unificado.
 * TopBar siempre overlay con blur (AppShell).
 */
export function PageShell({
  children,
  className,
  mode = "list",
}: Props) {
  const pathname = usePathname()
  const immersive = isImmersiveRoute(pathname)
  const insetFill = useChromeInset({ bottom: true })
  const insetBleed = useChromeInset({ bottom: true })

  // bleed no-immersive (desktop CAD): reserva top+bottom del chrome overlay.
  // immersive (/cad, /nesting mobile): el slot ya recorta top/bottom — no sumar pad.
  const bleedStyle =
    mode === "bleed" && !immersive
      ? {
          paddingTop: insetBleed.paddingTop,
          paddingBottom: insetBleed.paddingBottom,
        }
      : undefined

  return (
    <main
      className={cn(
        "flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none",
        "tablet:px-4 desktop:px-5 desktop:pb-3",
        (mode === "fill" || mode === "bleed") && "overflow-hidden",
        // bleed desktop: sin px lateral del shell para que el ring llegue al borde
        mode === "bleed" && "px-0 tablet:px-0 desktop:px-0 pb-0 desktop:pb-0",
        className,
      )}
      style={
        mode === "fill"
          ? insetFill
          : mode === "bleed"
            ? bleedStyle
            : undefined
      }
    >
      {children}
    </main>
  )
}
