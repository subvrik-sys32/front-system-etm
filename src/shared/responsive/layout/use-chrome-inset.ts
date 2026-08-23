"use client"

import type { CSSProperties } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { usePageSearchStore } from "@/shared/ui/entity-toolbar/page-search-store"
import {
  TOP_BAR_HEIGHT_PX,
  BOTTOM_NAV_HEIGHT_PX,
  PAGE_SEARCH_BAR_HEIGHT_PX,
  DESKTOP_TOP_BAR_HEIGHT_PX,
} from "@/shared/responsive/layout/chrome-constants"

type Options = {
  /** Si false, no aplica paddingBottom. Default true. */
  bottom?: boolean
}

/**
 * Único dueño del inset del chrome overlay (TopBar blur + BottomNav).
 * AppListScroll y PageShell leen de acá — ninguna page calcula px a mano.
 */
export function useChromeInset(options: Options = {}): CSSProperties {
  const { bottom = true } = options
  const { isMobile, isLandscape } = useResponsive()
  const searchOpen = usePageSearchStore(s => s.open && s.enabled)

  if (isMobile) {
    if (isLandscape) {
      return {
        paddingTop: searchOpen ? PAGE_SEARCH_BAR_HEIGHT_PX : 4,
        ...(bottom
          ? { paddingBottom: "env(safe-area-inset-bottom, 0px)" }
          : null),
      }
    }
    return {
      paddingTop:
        TOP_BAR_HEIGHT_PX + (searchOpen ? PAGE_SEARCH_BAR_HEIGHT_PX : 0),
      ...(bottom
        ? {
            paddingBottom: `calc(${BOTTOM_NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
          }
        : null),
    }
  }

  return {
    paddingTop: DESKTOP_TOP_BAR_HEIGHT_PX,
  }
}
