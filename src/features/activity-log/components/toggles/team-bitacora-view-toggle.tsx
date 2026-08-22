"use client"

import { Eye, Sun, Grid3x3 } from "lucide-react"

import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"
import {
  useTeamBitacoraViewStore,
  type TeamBitacoraViewMode,
} from "../../store/team-bitacora-view-store"
import { useSwipeSegment } from "./use-swipe-segment"

const OPTIONS: {
  value: TeamBitacoraViewMode
  label: string
  icon: typeof Sun
}[] = [
  { value: "day", label: "Día", icon: Sun },
  { value: "month", label: "Mes", icon: Grid3x3 },
  { value: "supervision", label: "Supervisión", icon: Eye },
]

const KEYS = OPTIONS.map(o => o.value) as TeamBitacoraViewMode[]

type Props = {
  compact?: boolean
}

export function TeamBitacoraViewToggle({ compact = false }: Props) {
  const value = useTeamBitacoraViewStore(s => s.viewMode)
  const onChange = useTeamBitacoraViewStore(s => s.setViewMode)
  const swipe = useSwipeSegment(KEYS, value, onChange)

  return (
    <div className="inline-flex touch-pan-y" {...swipe}>
      <EntityToggle
        value={value}
        onChange={onChange}
        options={OPTIONS}
        compact={compact}
        iconsOnly={compact}
        aria-label="Vista de bitácora del equipo"
      />
    </div>
  )
}
