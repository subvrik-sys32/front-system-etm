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
  /**
   * Targets táctiles ~36–44px. Siempre icono + label (ancho estable).
   */
  compact?: boolean
  /** Ocupa el 100% del contenedor (tabs de página en móvil). */
  fullWidth?: boolean
  className?: string
  "aria-label"?: string
}

/**
 * Toggle segmentado SSOT.
 * Ancho estable: columnas iguales (grid) + font-semibold fijo (no salta al activar).
 */
export function EntityToggle<T extends string>({
  value,
  onChange,
  options,
  compact = false,
  fullWidth = false,
  className,
  "aria-label": ariaLabel,
}: Props<T>) {
  const cols = Math.max(options.length, 1)

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "grid items-center gap-1 rounded-2xl bg-muted/60 p-1 shadow-xs backdrop-blur-md dark:bg-muted/40",
        compact ? "rounded-xl" : "h-9 rounded-2xl",
        fullWidth && "w-full",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
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
              "relative z-10 flex min-w-0 items-center justify-center gap-1.5 font-semibold select-none transition-colors duration-200",
              compact
                ? "h-9 rounded-lg px-2 text-xs"
                : "h-full rounded-xl px-3 text-xs tracking-tight",
              active
                ? "bg-background text-foreground shadow-xs ring-1 ring-border/5"
                : "text-muted-foreground hover:bg-background/40 hover:text-foreground",
            )}
          >
            {Icon ? (
              <Icon
                size={compact ? 15 : 14}
                strokeWidth={active ? 2.5 : 2}
                className={cn(
                  "shrink-0 transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground/80",
                )}
              />
            ) : null}
            <span className="min-w-0 truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}