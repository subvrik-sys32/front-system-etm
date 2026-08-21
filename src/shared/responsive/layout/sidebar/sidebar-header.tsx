"use client"

import Image from "next/image"

import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { TOOLBAR_CHROME_ICON_BTN } from "@/shared/ui/entity-toolbar/toolbar-chrome"
import { cn } from "@/shared/utils/utils"

type Props = {
  collapsed: boolean
  isDrawer?: boolean
}

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

  const isCollapsedMode = collapsed && !isDrawer

  const logoButton = (
    <button
      type="button"
      onClick={onLogoClick}
      title={logoTitle}
      aria-label={logoTitle}
      className={cn(
        TOOLBAR_CHROME_ICON_BTN,
        "group relative flex size-10 shrink-0 items-center justify-center rounded-xl p-2 transition-all active:scale-95",
      )}
    >
      <Image
        src="/icon.svg"
        alt="ETM S.A.C."
        width={32}
        height={32}
        priority
        draggable={false}
        className="max-h-6 w-auto select-object-contain transition-transform duration-200 group-hover:scale-105"
      />
    </button>
  )

  return (
    <div
      className={cn(
        "flex h-14 w-full shrink-0 items-center border-b border-border/40 px-3 transition-[gap] duration-200",
        // Sin texto visible: centrado real y sin gap reservado.
        // Con texto visible: alineado a la izquierda con separación normal.
        isCollapsedMode ? "justify-center gap-0" : "justify-start gap-3",
        isDrawer && "px-4",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center">
        {logoButton}
      </div>

      {(!collapsed || isDrawer) && (
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-xs font-bold tracking-tight text-primary dark:text-white">
            ETM S.A.C.
          </p>
          <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            ERP Industrial
          </p>
        </div>
      )}
    </div>
  )
}