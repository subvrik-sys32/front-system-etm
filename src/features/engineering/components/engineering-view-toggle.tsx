"use client"

import { Columns3, Users } from "lucide-react"

import { EntityToggle } from "@/shared/ui/entity-toggle/entity-toggle"
import {
  useEngineeringViewStore,
  type EngineeringViewMode,
} from "../store/engineering-view-store"

const OPTIONS: {
  value: EngineeringViewMode
  label: string
  icon: typeof Columns3
}[] = [
  { value: "processes", label: "Procesos", icon: Columns3 },
  { value: "list", label: "Lista", icon: Users },
]

type Props = {
  compact?: boolean
  fullWidth?: boolean
}

/** Mismo EntityToggle / visual que tabs de Bitácora (Producción…). */
export function EngineeringViewToggle({
  compact = false,
  fullWidth = false,
}: Props) {
  const value = useEngineeringViewStore(s => s.viewMode)
  const onChange = useEngineeringViewStore(s => s.setViewMode)

  return (
    <EntityToggle
      value={value}
      onChange={onChange}
      options={OPTIONS}
      compact={compact}
      fullWidth={fullWidth}
      aria-label="Vista de ingeniería"
    />
  )
}
