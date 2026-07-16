"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { cn } from "@/shared/utils/utils"

import { AppSidebar } from "../layout/app-sidebar"

export function SidebarDrawer() {

  const drawerOpen = useMobileNavStore(s => s.drawerOpen)
  const closeDrawer = useMobileNavStore(s => s.closeDrawer)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    closeDrawer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()])

  useEffect(() => {

    if (!drawerOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)

  }, [drawerOpen, closeDrawer])

  return (

    // Patrón "push/reveal": el sidebar NO se desliza ni flota
    // encima — vive fijo detrás del contenido (z-0, mismo nivel),
    // y es el contenido (CompactShell) el que se corre a la derecha
    // para revelarlo. No hay backdrop: cerrar es tocar la tarjeta
    // de contenido corrida (manejado en CompactShell).
    <div
      className={cn(
        "absolute inset-y-0 left-0 z-0 w-62",
        drawerOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!drawerOpen}
    >

      <div role="dialog" aria-modal="true" className="h-full">
        <AppSidebar variant="drawer" open />
      </div>

    </div>

  )

}