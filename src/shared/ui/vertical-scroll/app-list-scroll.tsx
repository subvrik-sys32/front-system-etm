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
import { usePageSearchStore } from "@/shared/ui/entity-toolbar/page-search-store"

type Props = {
  children: React.ReactNode
  /** Reset scroll to top when this key changes (default: pathname). */
  resetKey?: string
  className?: string
}

/**
 * Page list scroller.
 * - Mobile/tablet (compact): pads for fixed TopBar + BottomNav overlays.
 * - Desktop: fills the shell content slot.
 * - Scroll is native (overflow); no pull-to-refresh, no custom gesture physics.
 */
export function AppListScroll({ children, resetKey, className }: Props) {
  const pathname = usePathname()
  const key = resetKey ?? pathname
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { isMobile, isLandscape } = useResponsive()
  const searchOpen = usePageSearchStore(s => s.open && s.enabled)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [key])

  return (
    <ScrollArea
      ref={scrollRef}
      orientation="vertical"
      className="h-full min-h-0 min-w-0 flex-1"
    >
      <div
        className={cn("flex min-h-full flex-col", className)}
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
    </ScrollArea>
  )
}
