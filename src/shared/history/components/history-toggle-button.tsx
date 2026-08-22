"use client"

import { History } from "lucide-react"

import { FabTrigger } from "@/shared/ui/speed-dial-fab/fab-trigger"
import { SIDEBAR_COUNT_BADGE } from "@/shared/responsive/layout/sidebar/sidebar-row"
import { cn } from "@/shared/utils/utils"

type Props = {
  count: number
  active: boolean
  onClick: () => void
}

/** Mismo tono que SidebarRow activo: primary suave / translúcido (light + dark). */
const HISTORY_ACTIVE_CHROME =
  "bg-primary/10 text-primary shadow-xs hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:text-white dark:hover:bg-primary/20 dark:hover:text-white"

export function HistoryToggleButton({ count, active, onClick }: Props) {
  const badge =
    count > 0 ? (
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold select-none transition-colors duration-200 shadow-xs",
          // Activo: primary sólido + número blanco (igual light/dark, sin dark: que cambie tono)
          // Inactivo: burbuja suave del sidebar
          active ? "bg-primary text-white" : SIDEBAR_COUNT_BADGE,
          active && "animate-history-bounce",
        )}
      >
        {count > 9 ? "9+" : count}
      </span>
    ) : undefined

  return (
    <FabTrigger
      icon={History}
      label="HISTORIAL"
      active={active}
      onClick={onClick}
      badge={badge}
      className={cn(active && HISTORY_ACTIVE_CHROME)}
    />
  )
}
