"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
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
    // Wrapper transparente (sin fondo propio) — solo posiciona la
    // píldora. Absolute (no sticky-dentro-del-scroll): sticky fallaba
    // si el contenido era más corto que la pantalla, quedando pegado
    // al final del contenido en vez de siempre abajo del todo.
    <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3">

      <nav className="flex items-stretch gap-1 rounded-full bg-white/8 px-1.5 py-1.5 shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur-xl">

          {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            item.action.type === "link" &&
            (Array.isArray(item.matchPrefix)
              ? item.matchPrefix.some(prefix => pathname.startsWith(prefix))
              : pathname.startsWith(item.matchPrefix))

          const Icon = item.icon

          const content = (
            <div
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold"
            >

              {/* Un solo layoutId compartido entre las 4 posiciones —
                  motion anima solo la transición de "estaba en el tab
                  de antes" a "está en este", en vez de que cada tab
                  simplemente aparezca/desaparezca su propio fondo de
                  golpe al cambiar de página. */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-chip"
                  className="absolute inset-0 rounded-full bg-white/12"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex flex-col items-center gap-0.5 transition-colors",
                  isActive ? "text-white" : "text-neutral-500",
                )}
              >
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                {item.label}
              </span>

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