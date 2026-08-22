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

/**
 * Activo: ring vía FabTrigger (no cambia el fill / no translúcido).
 * Counter: primary sólido al activo, soft al inactivo.
 */
export function HistoryToggleButton({ count, active, onClick }: Props) {
  const badge =
    count > 0 ? (
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold select-none transition-colors duration-200 shadow-xs",
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
    />
  )
}
