import {
  ENTITY_ICONS,
  type EntityIcon,
} from "@/shared/constants/entity-icons"

import { MoreHorizontal, type LucideIcon } from "lucide-react"

// Antes esto era un catálogo propio y chico (7 íconos) — pero el
// selector de íconos del formulario de administración (que ahora
// reusa EntityIconPicker, igual que Cliente) permite elegir de TODO
// el catálogo compartido de la app. Este archivo queda solo como
// wrapper de esa misma fuente, para que lo que se elige en el
// formulario se pueda renderizar bien en cualquier lugar que
// muestre una actividad (Bitácora, el picker, la lista de admin).
export function getActivityIcon(icon: string): LucideIcon {
  return (ENTITY_ICONS as Record<string, LucideIcon>)[icon] ?? MoreHorizontal
}

export type { EntityIcon }