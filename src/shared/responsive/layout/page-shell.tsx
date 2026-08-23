"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"
import { useChromeInset } from "@/shared/responsive/layout/use-chrome-inset"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { usePathname } from "next/navigation"
import { isImmersiveRoute } from "../navigation/immersive-routes"

type Props = {
  children: ReactNode
  className?: string
  /**
   * fill  = Nesting/Bitácora desktop: inset top+bottom del chrome.
   * list  = listas: inset lo aplica AppListScroll.
   * bleed = CAD: DesktopShell reserva top bajo el topbar; mobile immersive no (slot).
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
  const { isMobile } = useResponsive()
  const insetFill = useChromeInset({ bottom: true })
  const insetBleed = useChromeInset({ bottom: true })

  // bleed:
  // - mobile immersive: CompactShell ya recorta con top: TOP_BAR — sin pad extra
  // - desktop/tablet (DesktopShell): topbar flota → un solo paddingTop aquí
  const mobileImmersive = immersive && isMobile
  const bleedStyle =
    mode === "bleed" && !mobileImmersive
      ? {
          paddingTop: insetBleed.paddingTop,
          ...(insetBleed.paddingBottom
            ? { paddingBottom: insetBleed.paddingBottom }
            : null),
        }
      : undefined

  return (
    <main
      className={cn(
        "flex h-full min-h-0 flex-col bg-background px-3 pt-0 pb-2 text-foreground select-none",
        "tablet:px-4 desktop:px-5 desktop:pb-3",
        (mode === "fill" || mode === "bleed") && "overflow-hidden",
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
