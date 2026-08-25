"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import {
  FAB_RIGHT_OFFSET_PX,
  FAB_Z_CLASS,
} from "./fab-layout"
import { suppressDismissClickThrough } from "@/components/ui/popover/suppress-dismiss-click-through"

type Props = {
  actions: ReactNode[]
  className?: string
}

function isInsideSheetOrPopover(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      '[data-slot="popover-content"],[data-slot="popover-sheet"],[data-slot="dialog-overlay"],[data-radix-dialog-overlay]',
    ),
  )
}

/**
 * FAB mobile — reglas de visibilidad (SSOT):
 * 1. Oculto solo con drawer de navegación abierto.
 * 2. Show/hide instantáneo (sin opacity fade → sin parpadeo).
 * 3. Dial se cierra al cambiar pathname o al ocultar chrome.
 * 4. Sheet/popover no ocultan el FAB (solo cierran el dial si tocas fuera).
 */
export function SpeedDialFab({ actions, className }: Props) {
  const [dialOpen, setDialOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const drawerOpen = useMobileNavStore(s => s.mode === "open")
  const hidden = drawerOpen

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setDialOpen(false)
  }, [pathname])

  useEffect(() => {
    if (hidden) setDialOpen(false)
  }, [hidden])

  // Scroll con pointer abajo → cierra dial (no momentum post finger-up).
  const pointerDownRef = useRef(false)
  useEffect(() => {
    const onDown = () => {
      pointerDownRef.current = true
    }
    const onUp = () => {
      pointerDownRef.current = false
    }
    const onScroll = (e: Event) => {
      if (isInsideSheetOrPopover(e.target)) return
      if (!pointerDownRef.current) return
      setDialOpen(false)
    }
    window.addEventListener("pointerdown", onDown, true)
    window.addEventListener("pointerup", onUp, true)
    window.addEventListener("pointercancel", onUp, true)
    window.addEventListener("scroll", onScroll, true)
    return () => {
      window.removeEventListener("pointerdown", onDown, true)
      window.removeEventListener("pointerup", onUp, true)
      window.removeEventListener("pointercancel", onUp, true)
      window.removeEventListener("scroll", onScroll, true)
    }
  }, [])

  useEffect(() => {
    if (!dialOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDialOpen(false)
    }

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (rootRef.current?.contains(target)) return
      if (isInsideSheetOrPopover(target)) return
      e.preventDefault()
      e.stopPropagation()
      suppressDismissClickThrough(400)
      setDialOpen(false)
    }

    window.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointerDown, true)
    }
  }, [dialOpen])

  if (actions.length === 0 || !mounted) return null

  return createPortal(
    <div
      ref={rootRef}
      data-slot="speed-dial-fab"
      className={cn(
        "pointer-events-none fixed bottom-22 flex flex-col items-center gap-2",
        FAB_Z_CLASS,
        // Instantáneo: no transition-opacity (evita parpadeo al abrir drawer / route).
        hidden ? "invisible" : "visible",
        className,
      )}
      style={{
        right: FAB_RIGHT_OFFSET_PX,
        pointerEvents: hidden ? "none" : undefined,
      }}
      aria-hidden={hidden}
    >
      {/* relative: acciones absolute arriba → el FAB principal no se desplaza */}
      <div className="pointer-events-auto relative flex size-12 items-center justify-center">
        {dialOpen ? (
          <div className="absolute bottom-full mb-2 flex flex-col items-center gap-2">
            {actions.map((action, i) => (
              <div key={i} className="flex items-center justify-center">
                {action}
              </div>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          aria-label={dialOpen ? "Cerrar acciones" : "Más acciones"}
          aria-expanded={dialOpen}
          onClick={() => setDialOpen(v => !v)}
          className={cn(
            "flex size-12 items-center justify-center rounded-full shadow-xs",
            "bg-muted text-foreground",
            dialOpen && "bg-muted text-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
        >
          {dialOpen ? (
            <X size={20} strokeWidth={2.5} />
          ) : (
            <SlidersHorizontal size={18} strokeWidth={2.4} />
          )}
        </button>
      </div>
    </div>,
    document.body,
  )
}
