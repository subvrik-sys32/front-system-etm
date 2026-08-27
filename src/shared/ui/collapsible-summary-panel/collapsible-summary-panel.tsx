"use client"

import { X } from "lucide-react"

import { cn } from "@/shared/utils/utils"

type Props = {
  expanded: boolean
  onCollapse: () => void
  collapsed: React.ReactNode
  children: React.ReactNode
  showCollapseButton?: boolean
}

/** Cerrar indicadores — badge fijo legible light/dark (tokens fab-plus). */
export function CollapseIndicatorsButton({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ocultar indicadores"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full tablet:size-8",
        "bg-fab-plus text-fab-plus-foreground shadow-xs",
        "transition-colors duration-150 hover:brightness-110",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fab-plus/40",
        className,
      )}
    >
      <X className="size-3.5 tablet:size-4" strokeWidth={2} />
    </button>
  )
}

export function CollapsibleSummaryPanel({
  expanded,
  onCollapse,
  collapsed,
  children,
  showCollapseButton = true,
}: Props) {
  return (
    <div className="w-full min-w-0">
      {!expanded ? (
        <div className="w-full min-w-0">
          {collapsed}
        </div>
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-1.5">
          {/* Fila propia: no absolute sobre la última KPI card */}
          {showCollapseButton && (
            <div className="flex w-full justify-start pl-0.5">
              <CollapseIndicatorsButton onClick={onCollapse} />
            </div>
          )}
          <div className="w-full min-w-0">{children}</div>
        </div>
      )}
    </div>
  )
}
