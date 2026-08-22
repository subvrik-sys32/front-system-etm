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
  /** Altura/radio densos (móvil). */
  compact?: boolean
  /** Oculta labels — solo iconos (Día/Semana/Mes en móvil). */
  iconsOnly?: boolean
  fullWidth?: boolean
  className?: string
  "aria-label"?: string
}

/**
 * SSOT de toggles segmentados (bitácora, ingeniería, CAD).
 * compact = misma huella visual que Producción/Ingeniería/Equipo en móvil.
 */
export function EntityToggle<T extends string>({
  value,
  onChange,
  options,
  compact = false,
  iconsOnly = false,
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
        "grid items-center gap-1 bg-muted/60 p-1 shadow-xs backdrop-blur-md dark:bg-muted/40",
        // compact y default: misma altura h-9 + rounded-xl (estilo bitácora móvil)
        compact ? "h-auto rounded-xl" : "h-9 rounded-2xl",
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
        const showLabel = !iconsOnly

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            title={option.label}
            aria-label={option.label}
            aria-pressed={active}
            className={cn(
              "relative z-10 flex min-w-0 items-center justify-center font-semibold select-none transition-colors duration-200",
              compact
                ? cn(
                    "h-9 rounded-lg text-xs",
                    iconsOnly ? "min-w-9 px-2" : "gap-1.5 px-2.5",
                  )
                : cn(
                    "h-full rounded-xl text-xs tracking-tight",
                    iconsOnly ? "min-w-9 px-2.5" : "gap-1.5 px-3",
                  ),
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
            {showLabel && (
              <span className="min-w-0 truncate">{option.label}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
