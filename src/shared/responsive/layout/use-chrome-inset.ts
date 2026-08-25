"use client"

import type { CSSProperties } from "react"
import { usePathname } from "next/navigation"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { usePageSearchStore } from "@/shared/ui/entity-toolbar/page-search-store"
import { isImmersiveRoute } from "@/shared/responsive/navigation/immersive-routes"
import {
  TOP_BAR_HEIGHT_PX,
  BOTTOM_NAV_HEIGHT_PX,
  PAGE_SEARCH_BAR_HEIGHT_PX,
  DESKTOP_TOP_BAR_HEIGHT_PX,
} from "@/shared/responsive/layout/chrome-constants"

type Options = {
  bottom?: boolean
}

/**
 * Inset del chrome overlay.
 *
 * Móvil landscape:
 * - immersive (/cad, /nesting): CompactShell ya hace top: TOP_BAR → padding mínimo
 * - listas (ingeniería, bitácora…): TOP_BAR completo o el toggle/content
 *   queda visualmente “dentro” del TopBar (como en el screenshot)
 */
export function useChromeInset(options: Options = {}): CSSProperties {
  const { bottom = true } = options
  const { isMobile, isLandscape } = useResponsive()
  const pathname = usePathname()
  const immersive = isImmersiveRoute(pathname)
  const searchOpen = usePageSearchStore(s => s.open && s.enabled)
  const searchExtra = searchOpen ? PAGE_SEARCH_BAR_HEIGHT_PX : 0

  if (isMobile) {
    // Non-immersive: siempre despejar TopBar (portrait y landscape).
    // Immersive landscape: el slot ya offsetea; no doblar padding.
    if (isLandscape && immersive) {
      return {
        paddingTop: searchOpen ? searchExtra : 4,
        ...(bottom
          ? { paddingBottom: "env(safe-area-inset-bottom, 0px)" }
          : null),
      }
    }

    return {
      paddingTop: TOP_BAR_HEIGHT_PX + searchExtra,
      ...(bottom
        ? {
            paddingBottom: isLandscape
              ? "env(safe-area-inset-bottom, 0px)"
              : `calc(${BOTTOM_NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
          }
        : null),
    }
  }

  // Desktop/tablet: despejar topbar + safe-area (notch / barra del browser).
  return {
    paddingTop: `calc(${DESKTOP_TOP_BAR_HEIGHT_PX}px + env(safe-area-inset-top, 0px))`,
  }
}
