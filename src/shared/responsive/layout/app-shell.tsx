"use client"

import type { ReactNode } from "react"

import { AppSidebar } from "./app-sidebar"
import { SidebarShowButton, CLOSED_RAIL_WIDTH } from "./sidebar-show-button"
import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { SidebarDrawer } from "@/shared/responsive/mobile/sidebar-drawer"
import { TopBar } from "@/shared/responsive/mobile/top-bar"
import { BottomNavigation } from "../mobile/bottom-navigation"
import { cn } from "@/shared/utils/utils"

type Props = {
  children: ReactNode
}

function DesktopShell({ children }: Props) {

  const mode = useSidebarStore(state => state.mode)

  const marginLeft =
    mode === "open"
      ? 248
      : mode === "collapsed"
        ? 72
        : CLOSED_RAIL_WIDTH

  return (
    <div className="relative h-screen overflow-hidden bg-[#050505] text-white">

      <AppSidebar />

      <SidebarShowButton />

      <main
        className="h-screen min-w-0 overflow-x-hidden overflow-y-auto transition-[margin] duration-200 ease-out"
        style={{
          marginLeft,
        }}
      >
        {children}
      </main>

    </div>
  )

}

// Ancho del sidebar del drawer (w-62 = 248px) — cuánto se desplaza
// el contenido hacia la derecha al abrir.
const DRAWER_REVEAL_OFFSET = 248

function CompactShell({ children }: Props) {

  const drawerOpen = useMobileNavStore(s => s.drawerOpen)
  const closeDrawer = useMobileNavStore(s => s.closeDrawer)

  return (

    // Patrón "push/reveal" (verificado frame a frame contra la app
    // de Claude): el sidebar vive DETRÁS, a nivel, siempre en su
    // lugar. Al abrir, es el CONTENIDO el que se desliza hacia la
    // derecha como una tarjeta (esquinas redondeadas en su borde
    // izquierdo + sombra), revelando el sidebar. Sin backdrop, sin
    // oscurecer, sin blur — el contenido queda nítido, solo corrido.
    <div className="relative h-dvh overflow-hidden bg-[#0A0A0A] text-white">

      <SidebarDrawer />

      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 flex-col overflow-hidden bg-[#050505] transition-transform duration-300 ease-out",
          drawerOpen &&
            "translate-x-[var(--drawer-offset)] rounded-l-[28px] shadow-[-16px_0_48px_rgba(0,0,0,0.55)]",
        )}
        style={{
          ["--drawer-offset" as string]: `${DRAWER_REVEAL_OFFSET}px`,
        }}
        // Con el drawer abierto, cualquier toque sobre la tarjeta
        // de contenido la vuelve a su lugar (cierra el drawer) sin
        // disparar la interacción de abajo — mismo comportamiento
        // que la app de Claude.
        onClickCapture={
          drawerOpen
            ? (event) => {
                event.preventDefault()
                event.stopPropagation()
                closeDrawer()
              }
            : undefined
        }
      >

        <TopBar />

        <main className="hide-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>

        <BottomNavigation />

      </div>

    </div>

  )

}

export function AppShell({ children }: Props) {

  const { isMobile } = useResponsive()

  if (isMobile) {
    return <CompactShell>{children}</CompactShell>
  }

  return <DesktopShell>{children}</DesktopShell>

}