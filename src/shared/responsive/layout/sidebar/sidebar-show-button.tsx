"use client"

import Image from "next/image"

import { useSidebarStore } from "@/shared/stores/sidebar-store"
import {
  TOOLBAR_CHROME_ICON_BTN,
  TOOLBAR_CHROME_ICON_SIZE,
} from "@/shared/ui/entity-toolbar/toolbar-chrome"
import { cn } from "@/shared/utils/utils"

/**
 * Solo visible con sidebar `closed`.
 * Mismo gesto que el logo del rail: advanceLayoutMode (reabre lastVisibleMode).
 * Estilo chrome del topbar (círculo size-8).
 */
export function SidebarShowButton() {
  const mode = useSidebarStore(state => state.mode)
  const advanceLayoutMode = useSidebarStore(state => state.advanceLayoutMode)

  if (mode !== "closed") return null

  return (
    <button
      type="button"
      onClick={() => advanceLayoutMode()}
      title="Mostrar barra lateral"
      aria-label="Mostrar barra lateral"
      className={cn(TOOLBAR_CHROME_ICON_BTN)}
    >
      <Image
        src="/icon.svg"
        alt="ETM"
        width={TOOLBAR_CHROME_ICON_SIZE + 4}
        height={TOOLBAR_CHROME_ICON_SIZE + 4}
        draggable={false}
        className="select-none object-contain"
      />
    </button>
  )
}
