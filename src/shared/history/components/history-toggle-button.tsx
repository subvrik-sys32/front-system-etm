
"use client"

import { History } from "lucide-react"

import { FabTrigger } from "@/shared/ui/speed-dial-fab/fab-trigger"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { SIDEBAR_COUNT_BADGE } from "@/shared/responsive/layout/sidebar/sidebar-row"
import { cn } from "@/shared/utils/utils"

type Props = {
  count: number
  active: boolean
  onClick: () => void
}

export function HistoryToggleButton({ count, active, onClick }: Props) {
  const { isMobile } = useResponsive()

  const badge =
    count > 0 ? (
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold select-none transition-colors duration-200 shadow-xs",
          // Activo: sólido (no se pierde sobre el chrome)
          // Inactivo: misma burbuja del sidebar
          active
            ? "bg-primary text-primary-foreground"
            : SIDEBAR_COUNT_BADGE,
          isMobile && !active && "ring-1 ring-primary/20",
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
      className={cn(
        // Evita que el activo se vea lavado / translúcido
        active &&
          "bg-primary/15 text-primary hover:text-primary dark:bg-primary/25 dark:text-primary-foreground",
      )}
    />
  )
}