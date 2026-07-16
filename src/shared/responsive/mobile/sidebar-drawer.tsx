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

    // Overlay absolute dentro del mismo contenedor h-dvh de
    // CompactShell — no fixed, no portal, no recálculo propio de
    // viewport. No hace falta lockear scroll del body: el backdrop
    // captura el touch cuando está abierto (pointer-events-auto),
    // así que lo que hay detrás (main) no se puede scrollear.
    <div
      className={cn(
        "absolute inset-0 z-30",
        drawerOpen
          ? "pointer-events-auto"
          : "pointer-events-none",
      )}
      aria-hidden={!drawerOpen}
    >

      <div
        role="presentation"
        onClick={closeDrawer}
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 ease-out",
          drawerOpen
            ? "opacity-100"
            : "opacity-0",
        )}
      />

      <div role="dialog" aria-modal="true">
        <AppSidebar variant="drawer" open={drawerOpen} />
      </div>

    </div>

  )

}