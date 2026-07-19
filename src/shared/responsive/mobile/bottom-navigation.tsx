"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/shared/utils/utils"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"
import { BOTTOM_NAV_ITEMS } from "@/shared/responsive/navigation/bottom-nav-items"

export function BottomNavigation() {
  const pathname = usePathname()
  const openDrawer = useMobileNavStore((s) => s.openDrawer)

  return (

    // Antes: barra plana, pegada de borde a borde, sin ningún
    // margen ni fondo con profundidad — el patrón "2016". Ahora
    // flota con margen alrededor (como GitHub/apps de referencia),
    // con vidrio esmerilado (backdrop-blur) y un aro sutil.
    <div className="px-3 pb-3">

      <nav className="flex items-stretch gap-1 rounded-full bg-white/8 px-1.5 py-1.5 ring-1 ring-white/10 backdrop-blur-xl">

        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            item.action.type === "link" &&
            pathname.startsWith(item.matchPrefix)

          const Icon = item.icon

          const content = (
            <div
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 text-[10px] font-semibold transition-colors",
                // El tab activo ahora tiene su PROPIO chip de fondo
                // redondeado — no solo un cambio de color del texto,
                // que era todo lo que hacía antes.
                isActive
                  ? "bg-white/12 text-white"
                  : "text-neutral-500",
              )}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
              {item.label}
            </div>
          )

          // Acción para abrir el Sidebar (Drawer)
          if (item.action.type === "sidebar") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={openDrawer}
                className="flex flex-1"
                aria-label={item.label}
              >
                {content}
              </button>
            )
          }

          // Acción para navegar
          return (
            <Link
              key={item.label}
              href={item.action.href}
              className="flex flex-1"
              aria-label={item.label}
            >
              {content}
            </Link>
          )
        })}

      </nav>

    </div>

  )
}