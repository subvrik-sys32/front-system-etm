"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/shared/utils/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import {
  TOP_BAR_HEIGHT_PX,
  BOTTOM_NAV_HEIGHT_PX,
  PAGE_SEARCH_BAR_HEIGHT_PX,
} from "@/shared/responsive/layout/chrome-constants"
import { PullToRefresh } from "@/shared/ui/pull-to-refresh/pull-to-refresh"
import { usePageSearchStore } from "@/shared/ui/entity-toolbar/page-search-store"

type Props = {
  children: React.ReactNode
  resetKey?: string
  className?: string
  /**
   * Pull-to-refresh (móvil). Si se pasa, se activa PTR
   * y recarga la página completa o ejecuta la acción deseada.
   */
  onRefresh?: () => void | Promise<void>
}

/**
 * Scroller centralizado por superficie de lista con soporte nativo de PTR.
 */
export function AppListScroll({
  children,
  resetKey,
  className,
  onRefresh,
}: Props) {
  const pathname = usePathname()
  const key = resetKey ?? pathname
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { isMobile, isLandscape } = useResponsive()
  const searchOpen = usePageSearchStore((s) => s.open && s.enabled)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [key])

  const content = (
    <div
      className={cn("flex h-full flex-col", className)}
      style={
        isMobile
          ? isLandscape
            ? {
                paddingTop: searchOpen ? PAGE_SEARCH_BAR_HEIGHT_PX : 4,
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }
            : {
                paddingTop:
                  TOP_BAR_HEIGHT_PX +
                  (searchOpen ? PAGE_SEARCH_BAR_HEIGHT_PX : 0),
                paddingBottom: `calc(${BOTTOM_NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
              }
          : undefined
      }
    >
      {children}
    </div>
  )

  return (
    <ScrollArea ref={scrollRef} orientation="vertical" className="h-full min-h-0 min-w-0 flex-1">
      {onRefresh && isMobile ? (
        <PullToRefresh
          scrollRef={scrollRef}
          onRefresh={async () => {
            if (onRefresh) {
              await onRefresh()
            } else {
              // Comportamiento por defecto: recarga de página completa
              await new Promise<void>(() => {
                window.location.reload()
              })
            }
          }}
        >
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
    </ScrollArea>
  )
}