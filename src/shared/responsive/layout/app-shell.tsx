"use client"

import type { ReactNode } from "react"

import { AppSidebar } from "./app-sidebar"
import { SidebarShowButton, CLOSED_RAIL_WIDTH } from "./sidebar-show-button"
import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { SidebarDrawer } from "@/shared/responsive/mobile/sidebar-drawer"
import { TopBar } from "@/shared/responsive/mobile/top-bar"
import { BottomNavigation } from "../mobile/bottom-navigation"

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

function CompactShell({ children }: Props) {

  return (

    // Este contenedor es la única fuente de verdad del alto de
    // pantalla en mobile (h-dvh). El drawer vive DENTRO de él como
    // overlay absolute, en vez de portal+fixed, para heredar esta
    // misma caja sin volver a calcular nada por su cuenta.
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#050505] text-white">

      <TopBar />

      <main className="hide-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>

      <BottomNavigation />

      <SidebarDrawer />

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