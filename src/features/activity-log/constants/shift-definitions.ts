import { Moon, Sun, Sunrise, type LucideIcon } from "lucide-react"
import type { DayShift } from "../types/activity-log.types"

type ShiftDefinition = {
  shift: DayShift
  label: string
  hours: string
  icon: LucideIcon
  // Rango en hora local (0-23) — se usa para saber si la franja ya
  // pasó, está corriendo, o todavía no llega (así el "pedido" de
  // loguear algo no aparece para una franja futura).
  startHour: number
  endHour: number
}

export const SHIFT_DEFINITIONS: ShiftDefinition[] = [

  {
    shift: "MORNING",
    label: "Mañana",
    hours: "06:00 – 12:00",
    icon: Sunrise,
    startHour: 6,
    endHour: 12,
  },

  {
    shift: "AFTERNOON",
    label: "Tarde",
    hours: "12:00 – 18:00",
    icon: Sun,
    startHour: 12,
    endHour: 18,
  },

  {
    shift: "NIGHT",
    label: "Noche",
    hours: "18:00 – 00:00",
    icon: Moon,
    startHour: 18,
    endHour: 24,
  },

]

export function getShiftState(
  def: ShiftDefinition,
  now: Date,
): "upcoming" | "current" | "past" {

  const hour = now.getHours()

  if (hour < def.startHour) {
    return "upcoming"
  }

  if (hour < def.endHour) {
    return "current"
  }

  return "past"

}