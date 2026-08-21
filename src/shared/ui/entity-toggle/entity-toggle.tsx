"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/utils/utils"

export type EntityToggleOption<T extends string = string> = {
  value: T
  label: string
  icon?: LucideIcon
}

type Props<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: EntityToggleOption<T>[]
  compact?: boolean
  className?: string
  "aria-label"?: string
}

/**
 * Toggle segmentado Premium — diseño sofisticado, ultra-fluido
 * y completamente basado en CSS nativo (sin desfases ni parpadeos).
 */
export function EntityToggle<T extends string>({
  value,
  onChange,
  options,
  compact = false,
  className,
  "aria-label": ariaLabel,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center gap-1 rounded-2xl bg-muted/60 p-1 backdrop-blur-md dark:bg-muted/40 shadow-xs",
        compact ? "rounded-xl p-1" : "h-9 rounded-2xl",
        className,
      )}
    >
      {options.map(option => {
        const Icon = option.icon
        const active = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            title={option.label}
            aria-label={option.label}
            aria-pressed={active}
            className={cn(
              "relative z-10 flex items-center justify-center font-medium select-none transition-all duration-300 ease-out",
              compact
                ? "size-9 rounded-lg"
                : "h-full gap-2 rounded-xl px-3.5 text-xs tracking-tight",
              active
                ? "bg-background text-foreground shadow-xs ring-1 ring-border/5"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            {Icon ? (
              <Icon
                size={compact ? 16 : 14}
                strokeWidth={active ? 2.5 : 2}
                className={cn(
                  "transition-colors duration-200 shrink-0",
                  active ? "text-primary" : "text-muted-foreground/80",
                )}
              />
            ) : null}
            {(!compact || options.length <= 2) && (
              <span className={cn("truncate", active ? "font-semibold" : "font-medium")}>
                {option.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}