"use client"

import Image from "next/image"

import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { ThemeToggle } from "@/shared/theme/theme-toggle"
import { cn } from "@/shared/utils/utils"

type Props = {
  collapsed: boolean
  isDrawer?: boolean
}

/**
 * Header del sidebar — densidad alta.
 *
 * Máquina de layout (desktop): un solo control = logo ETM
 *   open → collapsed → closed  (advanceLayoutMode)
 * Reabrir desde closed: logo en DesktopTopBar (SidebarShowButton).
 *
 * Sin iconos PanelLeftClose / EyeOff (ahorro de fila y de ruido).
 * Theme solo cuando hay ancho (open / drawer).
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
      ? "Ocultar barra lateral"
      : "Comprimir barra lateral"

  const logoButton = (
    <button
      type="button"
      onClick={onLogoClick}
      title={logoTitle}
      aria-label={logoTitle}
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-xl",
        "transition-colors hover:bg-foreground/10 active:bg-foreground/15",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      )}
    >
      <Image
        src="/icon.svg"
        alt="ETM SAC"
        width={32}
        height={32}
        priority
        draggable={false}
        className="select-none object-contain"
      />
    </button>
  )

  // —— Collapsed (rail de iconos): solo logo ——
  if (collapsed && !isDrawer) {
    return (
      <div className="flex w-full shrink-0 justify-center px-2 pb-2 pt-3">
        {logoButton}
      </div>
    )
  }

  // —— Open / drawer: logo + marca + theme ——
  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-col items-center gap-2",
        isDrawer ? "px-4 pb-3 pt-4" : "px-3 pb-2 pt-3",
      )}
    >
      {logoButton}

      <div className="flex flex-col items-center gap-0.5 text-center">
        <h1 className="text-sm font-semibold leading-tight tracking-tight text-primary dark:text-white">
          COMPANY S.A.C.
        </h1>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary/70 dark:text-white/70">
          ERP Industrial
        </p>
      </div>

      <ThemeToggle variant="icon" />
    </div>
  )
}
