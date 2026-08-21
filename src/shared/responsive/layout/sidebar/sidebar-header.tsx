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
  const advanceLayoutMode = useSidebarStore((s) => s.advanceLayoutMode)
  const closeDrawer = useMobileNavStore((s) => s.closeDrawer)

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

  const isRail = collapsed && !isDrawer

  return (
    <div className="flex h-12 w-full shrink-0 items-center border-b border-border/40 px-3">
      {/* 
        mx-auto mantiene todo el bloque centrado en el sidebar.
        Cero transiciones de movimiento o ancho para evitar cualquier efecto de desplazamiento.
      */}
      <div className={cn("mx-auto flex items-center", isRail ? "gap-0" : "gap-2.5")}>
        <button
          type="button"
          onClick={onLogoClick}
          title={logoTitle}
          aria-label={logoTitle}
          className={cn(
            TOOLBAR_CHROME_ICON_BTN,
            "flex size-9 shrink-0 items-center justify-center rounded-xl p-1.5",
          )}
        >
          <Image
            src="/icon.svg"
            alt="ETM COMPANY S.A.C."
            width={28}
            height={28}
            priority
            draggable={false}
            className="max-h-5 w-auto select-none object-contain shrink-0"
          />
        </button>

        {/* Si es rail, el texto se oculta inmediatamente sin animar su ancho ni deslizarse */}
        {!isRail && (
          <p className="overflow-hidden truncate whitespace-nowrap text-xs font-bold tracking-tight text-primary dark:text-white">
            ETM COMPANY SAC
          </p>
        )}
      </div>
    </div>
  )
}