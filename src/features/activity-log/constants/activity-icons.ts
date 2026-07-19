import {
  Coffee,
  GraduationCap,
  Hammer,
  MoreHorizontal,
  Package,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

// Mapa chico y propio de Bitácora — separado del ENTITY_ICONS
// compartido (usado por badges de Cliente/Etapa/etc. en toda la
// app) para no arriesgar nada ahí. Las keys son las mismas que
// activity-type.seed.ts en el backend.
export const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  hammer: Hammer,
  sparkles: Sparkles,
  wrench: Wrench,
  "graduation-cap": GraduationCap,
  users: Users,
  package: Package,
  coffee: Coffee,
  "more-horizontal": MoreHorizontal,
}

export function getActivityIcon(icon: string): LucideIcon {
  return ACTIVITY_ICONS[icon] ?? MoreHorizontal
}