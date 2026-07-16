import type { LucideIcon } from "lucide-react"
import { Factory, FolderKanban, ClipboardList, LayoutGrid } from "lucide-react" // Cambié UserRound por LayoutGrid (ejemplo)

type BottomNavAction =
  | { type: "link"; href: string }
  | { type: "sidebar" }

export type BottomNavItem = {
  label: string
  icon: LucideIcon
  action: BottomNavAction
  matchPrefix: string
}

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    label: "Proyectos",
    icon: FolderKanban,
    action: { type: "link", href: "/projects" },
    matchPrefix: "/projects",
  },
  {
    label: "Tareas",
    icon: ClipboardList,
    action: { type: "link", href: "/tasks" },
    matchPrefix: "/tasks",
  },
  {
    label: "Producción",
    icon: Factory,
    action: { type: "link", href: "/production" },
    matchPrefix: "/production",
  },
  {
    label: "Menú",
    icon: LayoutGrid, // Ícono para abrir el sidebar
    action: { type: "sidebar" },
    matchPrefix: "__never_matches__",
  },
]