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
 * Counter: cambio de clase instantáneo (sin transition-colors → sin barrido).
 * Activo del botón: ring vía FabTrigger.
 */
export function HistoryToggleButton({ count, active, onClick }: Props) {
  const badge =
    count > 0 ? (
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full px-1 text-[10px] font-bold leading-none shadow-xs select-none ring-2 ring-background",
          active ? "bg-primary text-white" : SIDEBAR_COUNT_BADGE,
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
