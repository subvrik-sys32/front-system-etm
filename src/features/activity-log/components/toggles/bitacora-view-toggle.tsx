"use client"

import { Columns3, Grid3x3, Sun } from "lucide-react"

import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"
import {
  useBitacoraViewStore,
  type BitacoraViewMode,
} from "../../store/bitacora-view-store"
import { useSwipeSegment } from "./use-swipe-segment"

const OPTIONS: {
  value: BitacoraViewMode
  label: string
  icon: typeof Sun
}[] = [
  { value: "day", label: "Día", icon: Sun },
  { value: "agenda", label: "Semana", icon: Columns3 },
  { value: "month", label: "Mes", icon: Grid3x3 },
]

const KEYS = OPTIONS.map(o => o.value) as BitacoraViewMode[]

type Props = {
  compact?: boolean
}

export function BitacoraViewToggle({ compact = false }: Props) {
  const value = useBitacoraViewStore(s => s.viewMode)
  const onChange = useBitacoraViewStore(s => s.setViewMode)
  const swipe = useSwipeSegment(KEYS, value, onChange)

  return (
    <div className="inline-flex touch-pan-y" {...swipe}>
      <EntityToggle
        value={value}
        onChange={onChange}
        options={OPTIONS}
        compact={compact}
        aria-label="Vista de bitácora"
      />
    </div>
  )
}
