"use client"

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react"
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
   * Default false = label + icono (formato CAD / Día·Semana·Mes).
   */
  compact?: boolean
  /** Reparte el ancho entre opciones (tabs de página en móvil). */
  fullWidth?: boolean
  className?: string
  "aria-label"?: string
}

/**
 * Toggle segmentado SSOT.
 * Visual = modelo CAD (bg-card + pastilla bg-background).
 * Movimiento = pastilla deslizante + swipe horizontal en touch.
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
  const trackRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })
  const touchStartX = useRef<number | null>(null)

  const measure = useCallback(() => {
    const track = trackRef.current
    const btn = btnRefs.current.get(value)
    if (!track || !btn) return
    const tr = track.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setPill({
      left: br.left - tr.left,
      width: br.width,
      ready: true,
    })
  }, [value])

  useLayoutEffect(() => {
    measure()
  }, [measure, options, compact, fullWidth])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => measure())
    ro.observe(track)
    return () => ro.disconnect()
  }, [measure])

  const goRelative = useCallback(
    (delta: number) => {
      const idx = options.findIndex(o => o.value === value)
      if (idx < 0) return
      const next = options[idx + delta]
      if (next) onChange(next.value)
    },
    [onChange, options, value],
  )

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }, [])

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const start = touchStartX.current
      touchStartX.current = null
      if (start == null) return
      const end = e.changedTouches[0]?.clientX
      if (end == null) return
      const dx = end - start
      // Umbral táctil: evita pelear con taps
      if (Math.abs(dx) < 48) return
      if (dx < 0) goRelative(1)
      else goRelative(-1)
    },
    [goRelative],
  )

  return (
    <div
      ref={trackRef}
      role="group"
      aria-label={ariaLabel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={cn(
        // Modelo CAD: superficie card + pastilla blanca/background
        "relative inline-flex items-center rounded-xl bg-card p-1 shadow-xs",
        compact && !fullWidth && "rounded-lg",
        fullWidth && "w-full",
        className,
      )}
    >
      {/* Pastilla deslizante */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 rounded-lg bg-background shadow-xs",
          "transition-[transform,width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          !pill.ready && "opacity-0",
        )}
        style={{
          width: pill.width,
          transform: `translateX(${pill.left}px)`,
        }}
      />

      {options.map(option => {
        const Icon = option.icon
        const active = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            ref={el => {
              if (el) btnRefs.current.set(option.value, el)
              else btnRefs.current.delete(option.value)
            }}
            onClick={() => onChange(option.value)}
            title={option.label}
            aria-label={option.label}
            aria-pressed={active}
            className={cn(
              "relative z-[1] flex items-center justify-center transition-colors duration-200",
              compact
                ? fullWidth
                  ? "h-11 min-w-0 flex-1 gap-1.5 rounded-lg px-2"
                  : "size-11 rounded-md"
                : "h-7 gap-1.5 rounded-lg px-3.5 text-xs font-semibold",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon ? (
              <Icon size={compact ? 16 : 14} strokeWidth={2.25} />
            ) : null}
            {(!compact || fullWidth) && (
              <span
                className={cn(
                  "truncate",
                  fullWidth ? "text-xs font-semibold" : undefined,
                )}
              >
                {option.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
