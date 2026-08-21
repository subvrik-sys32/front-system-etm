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

  const isRail = collapsed && !isDrawer

  return (
    // pl-3.5 fijo: mismo inset (14px) que el icono de las filas de navegación
    // (px-2 del contenedor + pl-1.5 de la fila), en rail y en expandido. El
    // logo nunca se mueve; solo el texto se desvanece.
    <div className="flex h-12 w-full shrink-0 items-center gap-2.5 border-b border-border/40 pl-3.5 pr-3">
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
          alt="ETM S.A.C."
          width={28}
          height={28}
          priority
          draggable={false}
          className="max-h-5 w-auto select-none object-contain"
        />
      </button>

      <p
        aria-hidden={isRail}
        className={cn(
          "min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-xs font-bold tracking-tight text-primary transition-opacity duration-150 dark:text-white",
          isRail ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        ETM S.A.C.
      </p>
    </div>
  )
}