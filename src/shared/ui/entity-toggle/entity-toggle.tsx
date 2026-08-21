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
   * Solo iconos, targets táctiles ~44px (toolbar móvil).
   * Default false = diseño bitácora Día/Semana/Mes (h-8, label + icono).
   */
  compact?: boolean
  /** Reparte el ancho entre opciones (tabs de página en móvil). */
  fullWidth?: boolean
  className?: string
  "aria-label"?: string
}

/**
 * Toggle segmentado SSOT — mismo diseño que Bitácora (Día / Semana / Mes).
 * Consumidores: bitácora, ingeniería, access, CAD, etc.
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
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center bg-foreground/5 p-0.5",
        compact ? "rounded-lg" : "h-8 rounded-xl",
        fullWidth && "w-full",
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
              "flex items-center justify-center transition",
              compact
                ? fullWidth
                  ? "h-11 min-w-0 flex-1 rounded-md px-2"
                  : "size-11 rounded-md"
                : "h-full gap-1.5 rounded-lg px-3 text-sm font-semibold",
              active
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon ? <Icon size={compact ? 16 : 14} strokeWidth={2.25} /> : null}
            {(!compact || fullWidth) && (
              <span className={fullWidth ? "truncate text-xs font-semibold" : undefined}>
                {option.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
