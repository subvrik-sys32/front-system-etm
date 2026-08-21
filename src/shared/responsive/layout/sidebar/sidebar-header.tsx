"use client"

import Image from "next/image"

import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import {
  TOOLBAR_CHROME_ICON_BTN,
  TOOLBAR_CHROME_ICON_SIZE,
} from "@/shared/ui/entity-toolbar/toolbar-chrome"
import { cn } from "@/shared/utils/utils"

type Props = {
  collapsed: boolean
  isDrawer?: boolean
}

/**
 * Header del sidebar.
 * - Logo = mismo chrome del topbar (círculo size-8).
 * - Open: [logo | marca] en fila.
 * - Theme vive en DesktopTopBar.
 * - Logo: open ↔ collapsed (advanceLayoutMode).
 */
export function SidebarHeader({ collapsed, isDrawer = false }: Props) {
  const advanceLayoutMode = useSidebarStore(s => s.advanceLayoutMode)
  const closeDrawer = useMobileNavStore(s => s.closeDrawer)

  const onLogoClick = () => {
    if (isDrawer) {
      closeDrawer()
      return
    }
    advanceLayoutMode()
  }

  const logoTitle = isDrawer
    ? "Cerrar menú"
    : collapsed
      ? "Expandir barra lateral"
      : "Comprimir barra lateral"

  const logoButton = (
    <button
      type="button"
      onClick={onLogoClick}
      title={logoTitle}
      aria-label={logoTitle}
      className={cn(TOOLBAR_CHROME_ICON_BTN, "shrink-0")}
    >
      <Image
        src="/icon.svg"
        alt="ETM SAC"
        width={TOOLBAR_CHROME_ICON_SIZE + 4}
        height={TOOLBAR_CHROME_ICON_SIZE + 4}
        priority
        draggable={false}
        className="select-none object-contain"
      />
    </button>
  )

  if (collapsed && !isDrawer) {
    return (
      <div className="flex w-full shrink-0 justify-center px-2 py-1.5">
        {logoButton}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex w-full shrink-0 items-center gap-2.5",
        isDrawer ? "px-4 py-3" : "px-3 py-1.5",
      )}
    >
      {logoButton}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-semibold text-primary dark:text-white">
          COMPANY S.A.C.
        </p>
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-primary/70 dark:text-white/70">
          ERP Industrial
        </p>
      </div>
    </div>
  )
}
