"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { usePathname, useSearchParams } from "next/navigation"

import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { cn } from "@/shared/utils/utils"

import { AppSidebar } from "../layout/app-sidebar"

export function SidebarDrawer() {

  const drawerOpen = useMobileNavStore(s => s.drawerOpen)
  const closeDrawer = useMobileNavStore(s => s.closeDrawer)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    closeDrawer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()])

  // Nota: no hacemos scroll-lock manual del body acá. Radix Dialog
  // (usado por FormDialog/ProfileDialog, etc.) ya trae su propio
  // scroll-lock vía react-remove-scroll. Si este drawer también
  // tocara document.body.style.overflow, ambos mecanismos pisan
  // el valor "previo" que cada uno restaura al cerrar, dejando el
  // body en un estado inconsistente cuando conviven abiertos al
  // mismo tiempo — eso era lo que producía el corte negro arriba/
  // abajo en iOS. El propio drawer, al ser fixed + translate-x,
  // no necesita bloquear el scroll del body para funcionar bien.

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

  if (!mounted) {
    return null
  }

  return createPortal(

    <>

      <div
        role="presentation"
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 h-dvh",
          "z-30 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 ease-out",
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <div role="dialog" aria-modal="true" aria-hidden={!drawerOpen}>
        <AppSidebar variant="drawer" open={drawerOpen} />
      </div>

    </>,

    document.body,

  )

}