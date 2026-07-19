import type { LucideIcon } from "lucide-react"
import { Factory, FolderKanban, ClipboardList, NotebookPen } from "lucide-react"

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
    // Antes: "Menú", abría el sidebar (acción "sidebar"). Ya se
    // puede abrir el mismo sidebar desde el ☰ del TopBar, así que
    // no se pierde ese acceso — este lugar pasa a ser la Bitácora.
    label: "Bitácora",
    icon: NotebookPen,
    action: { type: "link", href: "/bitacora" },
    matchPrefix: "/bitacora",
  },
]